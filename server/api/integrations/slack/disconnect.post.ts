import { defineEventHandler, getHeaders, setResponseStatus } from "h3";
import { query } from "../../../utils/db";
import { CustomError } from "../../../utils/custom.error";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const headers = getHeaders(event);
  const authHeader = headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new CustomError("Missing or invalid Authorization header", 401);
  }

  const token = authHeader.split(" ")[1];
  let orgId: string;

  try {
    const decoded = jwt.verify(token, config.jwtToken as string) as {
      org_id: string;
    };
    orgId = decoded.org_id;
  } catch {
    throw new CustomError("Invalid or expired token", 401);
  }

  // Check if a mapping exists before updating
  const checkMapping = await query(
    `SELECT access_token FROM slack_team_mappings WHERE org_id = $1 AND status = 'active'`,
    [orgId]
  );

  if (!checkMapping.rows.length) {
    throw new CustomError("No active Slack mapping found for this organization", 404);
  }

  const accessToken = checkMapping.rows[0].access_token;

  // Optional: Revoke token at Slack
  if (accessToken) {
    await fetch("https://slack.com/api/auth.revoke", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  // Set to inactive in DB
  await query(
    `UPDATE slack_team_mappings SET status = 'inactive', updated_at = NOW() WHERE org_id = $1`,
    [orgId]
  );

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: 'Slack disconnected successfully'
  };
});
