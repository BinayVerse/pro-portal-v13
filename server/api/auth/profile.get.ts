import { defineEventHandler } from 'h3';
import { query } from '../../utils/db';
import { CustomError } from '../../utils/custom.error';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const token = event.node.req.headers['authorization']?.split(' ')[1];

  if (!token) {
    throw new CustomError('Unauthorized: No token provided', 401);
  }

  let userId: string;
  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string);
    userId = (decodedToken as { user_id: string }).user_id;
  } catch {
    throw new CustomError('Unauthorized: Invalid token', 401);
  }

  if (!userId) {
    throw new CustomError('Unauthorized: User ID missing in token', 401);
  }

  const userQuery = `
    SELECT 
      u.user_id, 
      u.name, 
      u.email, 
      u.contact_number, 
      u.primary_contact, 
      u.org_id,
      COALESCE(o.org_name, '') AS company
    FROM users u
    LEFT JOIN organizations o ON u.org_id = o.org_id
    WHERE u.user_id = $1
  `;

  try {
    const result = await query(userQuery, [userId]);

    if (!result?.rows?.length) {
      throw new CustomError('User or Organization not found', 404);
    }

    const userData = result.rows[0];

    return {
      statusCode: 200,
      status: 'success',
      message: 'User profile fetched successfully',
      data: {
        ...userData,
        isCompanyRegistered: !!userData.org_id,
      },
    };
  } catch (error) {
    console.error(error);
    throw new CustomError('Failed to fetch user profile', 500);
  }
});
