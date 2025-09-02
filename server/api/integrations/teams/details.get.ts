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

    try {
        const result = await query(
            `SELECT tenant_id, app_id, status, service_url, created_at, updated_at
            FROM teams_tenant_mappings
            WHERE org_id = $1 ORDER BY updated_at DESC LIMIT 1`,
            [orgId]
        );

        setResponseStatus(event, 200);

        if (result.rows.length === 0) {
            return {
                statusCode: 200,
                message: 'No Teams tenant mapping found for this organization',
                data: {
                    tenant_id: '',
                    app_id: '',
                    status: '',
                    service_url: '',
                },
            };
        }

        return {
            statusCode: 200,
            message: 'Teams tenant details fetched successfully',
            data: result.rows[0],
        };
    } catch (err) {
        console.error('DB error (Teams details):', err);
        throw new CustomError('Failed to fetch Teams tenant details.', 500);
    }
});
