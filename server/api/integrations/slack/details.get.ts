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

  const result = await query(
    `SELECT team_id, team_name, org_id, status FROM slack_team_mappings WHERE org_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [orgId]
  );

  setResponseStatus(event, 200);

  if (result.rows.length === 0) {
    return {
      statusCode: 200,
      message: "No Slack team mapping found for this organization",
      data: {
        team_id: "",
        team_name: "",
        org_id: "",
        status: "",
      },
    };
  }

  return {
    statusCode: 200,
    message: "Slack team details fetched successfully",
    data: result.rows[0],
  };
});
