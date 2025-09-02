import { defineEventHandler, readBody, setResponseStatus } from 'h3';
import { CustomError } from '../../utils/custom.error';
import { SigninValidation } from '../../utils/validations';
import { query } from '../../utils/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const secret = config.jwtToken as string;

  try {
    const body = await readBody(event);
    const validation = SigninValidation.safeParse(body);

    if (!validation.success) {
      throw new CustomError('Please check that your email and password are entered correctly.', 400);
    }

    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    // Additional validation for trimmed password
    if (!password || password.length === 0) {
      throw new CustomError('Password cannot be empty.', 400);
    }

    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 AND role_id IN (0, 1)',
      [email]
    );

    if (!userResult?.rows?.length) {
      throw new CustomError('No account found with this email address. Please sign up first or check your email.', 404);
    }

    const adminUsers = userResult.rows.filter(
      (u: any) => u.role_id === 0 || u.role_id === 1
    );

    if (adminUsers.length > 1) {
      throw new CustomError(
        'Multiple admin roles detected for your account. Please contact support to resolve this issue.',
        403
      );
    }

    const user = adminUsers[0];

    if (!user) {
      throw new CustomError('Your account access has been restricted. Please contact your administrator for assistance.', 403);
    }

    // Check if user has a password set
    if (!user.password || user.password.length === 0) {
      throw new CustomError('Your account password is not set. Please contact support or reset your password.', 403);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new CustomError('The password you entered is incorrect. Please try again or reset your password.', 403);
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        org_id: user.org_id,
      },
      secret,
      { expiresIn: '1h' }
    );

    setResponseStatus(event, 201);

    return {
      statusCode: 201,
      status: 'success',
      token,
      user,
      redirect: '/profile',
    };

  } catch (error: unknown) {
    console.error('Sign-in Handler Error:', error);

    if (error instanceof CustomError) {
      setResponseStatus(event, error.statusCode);
      return {
        status: 'error',
        message: error.message,
      };
    }

    setResponseStatus(event, 500);
    return {
      status: 'error',
      message: 'We\'re experiencing technical difficulties. Please try again in a few moments.',
    };
  }
});
