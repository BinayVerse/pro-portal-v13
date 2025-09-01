import { defineEventHandler, readBody } from 'h3';
import { CustomError } from '../../utils/custom.error';
import { query } from '../../utils/db';
import { sendWelcomeMail, generateRandomPassword } from '../helper';
import { GoogleSignupValidation } from '../../utils/validations';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { isPersonalEmail, personalEmailDomains } from '../../utils/auth-utils';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const secret = config.jwtToken as string;

    try {
        const params = await readBody(event);
        const token = event.node.req.headers['authorization']?.split(' ')[1];

        if (!token) {
            throw new CustomError('Unauthorized: No token provided', 401);
        }

        const requiredFields = ['name', 'email', 'contact_number', 'company'];
        for (const field of requiredFields) {
            if (!params[field]) {
                throw new CustomError(`Please enter your ${field.replace('_', ' ')}`, 400);
            }
        }

        const { user_id, name, email, company, contact_number } = params;
        const { error } = GoogleSignupValidation.validate(params);
        if (error) throw new CustomError(`Validation error: ${error.details[0].message}`, 400);

        if (name.length < 3 || company.trim().length < 3) {
            throw new CustomError('Name and Company name must be at least 3 characters long', 400);
        }

        const userQuery = `
            SELECT users.*, organizations.org_id, organizations.org_name AS company
            FROM users
            LEFT JOIN organizations ON users.org_id = organizations.org_id
            WHERE users.user_id = $1
            `;
        const userResult = await query(userQuery, [user_id]);
        if (!userResult.rows.length) throw new CustomError('User not found', 404);

        const currentUser = userResult.rows[0];
        const updates = [];
        const values = [];
        let orgId = currentUser.org_id;
        let isCompanyUpdated = false;
        let newToken: string | null = null;

        // Company update
        if (company !== currentUser.company) {
            const companyExists = await query(`SELECT org_id FROM organizations WHERE org_name = $1`, [company]);
            if (companyExists.rows.length) {
                throw new CustomError('Company is already registered, please contact admin.', 409);
            }

            const newOrg = await query(
                `INSERT INTO organizations (org_name, created_at) VALUES ($1, NOW()) RETURNING org_id`,
                [company]
            );
            if (!newOrg.rows.length) throw new CustomError('Failed to create new company', 500);

            orgId = newOrg.rows[0].org_id;
            const defaultCategories = [
                'Policies & Procedures',
                'Training & Onboarding',
                'Product / Service Information',
                'Legal & Compliance',
                'Technical / Operational Documentation',
            ];

            for (const cat of defaultCategories) {
                await query(`INSERT INTO document_category (name, org_id, added_by) VALUES ($1, $2, $3)`, [cat, orgId, user_id]);
            }

            await query(`UPDATE users SET role_id = '1', org_id = $1, contact_number = $2 WHERE user_id = $3`, [orgId, contact_number, user_id]);
            newToken = jwt.sign({ user_id, email, org_id: orgId }, secret, { expiresIn: '1h' });
            isCompanyUpdated = true;
            updates.push(`org_id = $${updates.length + 1}`);
            values.push(orgId);
        }

        // Email update with domain checks
        if (email !== currentUser.email) {
            const isCurrentPersonal = isPersonalEmail(currentUser.email, personalEmailDomains);
            const isNewPersonal = isPersonalEmail(email, personalEmailDomains);
            if (!isCurrentPersonal && isNewPersonal) {
                throw new CustomError('Please use a valid domain-based company email address', 403);
            }

            const emailCheck = await query(`SELECT user_id FROM users WHERE email = $1 AND user_id != $2`, [email, user_id]);
            if (emailCheck.rows.length) throw new CustomError('Email is already in use by another user', 409);

            updates.push(`email = $${updates.length + 1}`);
            values.push(email);
        }

        // Contact number update
        if (contact_number !== currentUser.contact_number) {
            const contactCheck = await query(`SELECT user_id FROM users WHERE contact_number = $1 AND user_id != $2`, [contact_number, user_id]);
            if (contactCheck.rows.length) throw new CustomError('This WhatsApp number is already registered', 409);

            updates.push(`contact_number = $${updates.length + 1}`);
            values.push(contact_number);
        }

        // Name update
        if (name !== currentUser.name) {
            updates.push(`name = $${updates.length + 1}`);
            values.push(name);
        }

        if (updates.length === 0) {
            return { statusCode: 200, message: 'Nothing to update', userId: currentUser.user_id };
        }

        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push(`password = $${updates.length + 1}`);
        values.push(hashedPassword);

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(user_id);

        const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${values.length} RETURNING user_id`;
        const result = await query(updateQuery, values);
        if (!result.rowCount) throw new CustomError('User not found', 404);

        // Welcome mail after new company setup
        if (isCompanyUpdated) {
            await query('UPDATE users SET password = $1 WHERE user_id = $2', [hashedPassword, user_id]);
            await sendWelcomeMail(name, email, password, `${config.public.appUrl}/login`);
        }

        return {
            statusCode: isCompanyUpdated ? 201 : 200,
            message: 'Profile updated successfully',
            userId: result.rows[0].user_id,
            ...(isCompanyUpdated ? { authToken: newToken } : {}),
        };
    } catch (err: any) {
        console.error('Error updating user:', err);
        throw new CustomError(err.message || 'Internal Server Error', err.statusCode || 500);
    }
});
