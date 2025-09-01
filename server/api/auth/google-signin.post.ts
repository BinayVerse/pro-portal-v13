import { defineEventHandler, readBody } from 'h3';
import { CustomError } from '../../utils/custom.error';
import { query } from '../../utils/db';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { isPersonalEmail, personalEmailDomains } from '../../utils/auth-utils';

const config = useRuntimeConfig();
const googleClientId = config.public.googleClientId;
const googleClient = new OAuth2Client(googleClientId);

export default defineEventHandler(async (event) => {
  const secret = config.jwtToken as string;

  try {
    const body = await readBody(event);

    if (!body.googleToken) {
      throw new CustomError('Google token is required', 400);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: body.googleToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new CustomError('Invalid Google token payload', 400);
    }

    const email = payload.email;
    const name = payload.name || '';
    let user = null;
    let newUser = false;

    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 AND role_id IN (0, 1)',
      [email]
    );

    if (!userResult?.rows?.length) {
      newUser = true;

      if (isPersonalEmail(email, personalEmailDomains)) {
        throw new CustomError('Signup is not allowed with personal email addresses.', 400);
      }

      try {
        const newUserResult = await query(
          `INSERT INTO users (email, name, org_id, contact_number, primary_contact, created_at)
           VALUES ($1, $2, NULL, NULL, FALSE, NOW())
           RETURNING *`,
          [email, name]
        );
        user = newUserResult.rows[0];
      } catch {
        throw new CustomError('Failed to insert new user', 500);
      }
    } else {
      const adminRoles = userResult.rows.filter(
        (u: any) => u.role_id === 1 || u.role_id === 0
      );

      if (adminRoles.length > 1) {
        throw new CustomError(
          'User has multiple admin/super admin roles across different organizations. Please contact support.',
          401
        );
      }

      if (!adminRoles.length) {
        throw new CustomError('User login is not allowed, please contact admin.', 401);
      }

      user = adminRoles[0];
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, org_id: user.org_id },
      secret,
      { expiresIn: '1h' }
    );

    return {
      statusCode: newUser ? 201 : 200,
      status: 'success',
      message: newUser ? 'Please fill in all your details.' : 'Login successfully',
      token,
      user,
      redirect: '/profile',
    };
  } catch (error: unknown) {
    const message =
      error instanceof CustomError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'An unknown error occurred';

    return {
      statusCode: error instanceof CustomError && error.statusCode ? error.statusCode : 400,
      status: 'error',
      message,
    };
  }
});
