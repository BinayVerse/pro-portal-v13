import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { CustomError } from "../../utils/custom.error";
import { query } from "../../utils/db";
import bcrypt from "bcrypt";
import { sendPasswordUpdatedMail } from '../helper';
import { getPasswordRegex } from "../../utils/validations";

export default defineEventHandler(async (event) => {
  try {
    const { token, newPassword } = await readBody(event);
    const cleanPassword = newPassword?.trim();

    if (!token || !cleanPassword) {
      throw new CustomError("Token and new password are required", 400);
    }

    if (!getPasswordRegex().test(cleanPassword)) {
      throw new CustomError(
        'Password must contain at least one uppercase, lowercase, special character, and digit with a minimum of 8 characters. The characters ", \', <, >, `, \\ are prohibited.',
        400
      );
    }

    const result = await query(
      "SELECT * FROM users WHERE reset_token = $1",
      [token]
    );

    if (result.rowCount === 0) {
      throw new CustomError("Invalid token", 404); // Changed to 404 for "not found"
    }

    const user = result.rows[0];
    const { name, email, reset_token_expiry } = user;

    if (reset_token_expiry && reset_token_expiry < new Date()) {
      throw new CustomError("Reset token has expired", 400);
    }

    // Check if user has a password set before comparing
    if (user.password && user.password.length > 0) {
      const isPasswordMatch = await bcrypt.compare(cleanPassword, user.password);
      if (isPasswordMatch) {
        throw new CustomError("You cannot reuse your last password", 400);
      }
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const updateResult = await query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2",
      [hashedPassword, token]
    );

    if (updateResult.rowCount === 0) {
      throw new CustomError("Failed to update password. Please try again later.", 500);
    }

    try {
      await sendPasswordUpdatedMail(name, email);

      setResponseStatus(event, 201);

      return {
        statusCode: 201,
        status: 'success',
        message: 'Password updated successfully, confirmation email sent.',
      };
    } catch (error) {
      throw new CustomError('Failed to send email', 500);
    }

  } catch (error: any) {
    console.error(error);

    // Pass through known CustomError instances
    if (error instanceof CustomError) {
      throw error;
    }

    throw new CustomError(error?.message || 'An error occurred during password reset.', 500);
  }
});
