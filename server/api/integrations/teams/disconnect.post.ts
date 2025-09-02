import { defineEventHandler, getHeaders, setResponseStatus } from 'h3';
import jwt from 'jsonwebtoken';
import { query } from '../../../utils/db';
import { CustomError } from '../../../utils/custom.error';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const headers = getHeaders(event);

    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new CustomError('Missing or invalid Authorization header', 401);
    }

    const token = authHeader.split(' ')[1];
    let orgId: string;

    try {
        const decoded = jwt.verify(token, config.jwtToken as string) as { org_id: string };
        orgId = decoded.org_id;
    } catch {
        throw new CustomError('Invalid or expired token', 401);
    }

    // Check if a mapping exists before updating
    const checkMapping = await query(
        `SELECT status FROM teams_tenant_mappings WHERE org_id = $1 AND status = 'active'`,
        [orgId]
    );

    if (!checkMapping.rows.length) {
        throw new CustomError('No active Teams mapping found for this organization', 404);
    }

    try {
        await query(
            `UPDATE teams_tenant_mappings SET status = 'inactive', updated_at = NOW() WHERE org_id = $1`,
            [orgId]
        );

        setResponseStatus(event, 200);
        return {
            statusCode: 200,
            message: 'Teams disconnected successfully',
        };
    } catch (err) {
        console.error('DB error (Teams disconnect):', err);
        throw new CustomError('Failed to disconnect Teams tenant.', 500);
    }
});
