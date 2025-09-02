import { defineEventHandler, readBody, setResponseStatus } from 'h3';
import { CustomError } from '../../utils/custom.error';
import { getPasswordRegex, SignupValidation } from '../../utils/validations';
import { query } from '../../utils/db';
import bcrypt from 'bcrypt';
import { isPersonalEmail, personalEmailDomains } from '../../utils/auth-utils';
import { sendWelcomeMail } from '../helper';

const isValidPhoneNumber = (wpNumber: string): boolean => {
  const phoneRegex = /^\+(\d{1,3})\d{10,14}$/;
  return phoneRegex.test(wpNumber);
};

export default defineEventHandler(async (event) => {
  const params = await readBody(event);
  const config = useRuntimeConfig();

  try {
    if (!params.name) throw new CustomError('Please enter your name', 400);
    if (!params.email) throw new CustomError('Please enter your email address', 400);
    if (!params.wpNumber) throw new CustomError('Please enter your WhatsApp number', 400);
    if (!params.password) throw new CustomError('Please enter your password', 400);
    if (!params.companyName) throw new CustomError('Please enter your company name', 400);

    if (isPersonalEmail(params.email, personalEmailDomains)) {
      throw new CustomError('Signup is not allowed with personal email addresses.', 400);
    }

    if (!getPasswordRegex().test(params.password)) {
      throw new CustomError(
        'Password must contain at least one uppercase, lowercase, special character, and digit with a minimum of 8 characters. The characters ", \', <, >, `, \\ are prohibited.',
        400
      );
    }

    const validation = SignupValidation.safeParse(params);
    if (!validation.success) {
      throw new CustomError('Validation error: ' + validation.error.errors[0].message, 400);
    }

    if (params.name.length < 3) throw new CustomError('Name must be at least 3 characters long', 400);
    if (params.companyName.length < 3) throw new CustomError('Company name must be at least 3 characters long', 400);

    params.companyName = params.companyName.trim();

    const existingCompany = await query('SELECT * FROM organizations WHERE org_name = $1', [params.companyName]);
    let orgId: string;
    let isCompanyExists = !existingCompany?.rows?.length;

    const existingUserByEmail = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [params.email]);
    if (existingUserByEmail?.rows?.length) {
      throw new CustomError('User is already registered with this email', 409);
    }

    if (!params.wpNumber.startsWith('+') || !isValidPhoneNumber(params.wpNumber)) {
      throw new CustomError('WhatsApp number must include a valid country code and be correctly formatted.', 400);
    }

    const existingUserByPhone = await query('SELECT * FROM users WHERE contact_number = $1', [params.wpNumber]);
    if (existingUserByPhone?.rows?.length) {
      throw new CustomError('This WhatsApp number is already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(params.password, 10);
    const roleId = isCompanyExists ? '1' : '2';
    const appLink = `${config.public.appUrl}/login`;

    if (isCompanyExists) {
      const newOrg = await query(
        'INSERT INTO organizations (org_name) VALUES ($1) RETURNING org_id',
        [params.companyName]
      );
      orgId = newOrg.rows[0].org_id;
    } else {
      throw new CustomError('Company is already registered, please contact admin', 409);
    }

    const user = await query(
      'INSERT INTO users (email, password, name, org_id, contact_number, role_id, primary_contact) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [params.email, hashedPassword, params.name, orgId, params.wpNumber, roleId, isCompanyExists]
    );

    const userId = user.rows[0].user_id;

    const defaultCategories = [
      'Policies & Procedures',
      'Training & Onboarding',
      'Product / Service Information',
      'Legal & Compliance',
      'Technical / Operational Documentation',
    ];

    for (const category of defaultCategories) {
      await query(
        `INSERT INTO document_category (name, org_id, added_by) VALUES ($1, $2, $3)`,
        [category, orgId, userId]
      );
    }

    await sendWelcomeMail(params.name, params.email, params.password, appLink);

    setResponseStatus(event, 201);

    return {
      statusCode: 201,
      status: 'success',
      data: user.rows[0],
    };
  } catch (error: unknown) {
    console.error('Signup error:', error);

    if (error instanceof CustomError) {
      setResponseStatus(event, error.statusCode);
      return {
        statusCode: error.statusCode,
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }

    if (error instanceof Error) {
      setResponseStatus(event, 500);
      return {
        statusCode: 500,
        status: 'error',
        message: error.message || 'An unexpected error occurred during signup',
        timestamp: new Date().toISOString()
      };
    }

    setResponseStatus(event, 500);
    return {
      statusCode: 500,
      status: 'error',
      message: 'An unknown error occurred during signup',
      timestamp: new Date().toISOString()
    };
  }
});
