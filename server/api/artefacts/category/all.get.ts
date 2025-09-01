import { defineEventHandler, setResponseStatus } from 'h3'
import { query } from '../../../utils/db'
import { CustomError } from '../../../utils/custom.error'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = event.node.req.headers['authorization']?.split(' ')[1]

  if (!token) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: No token provided', 401)
  }

  let userId
  let orgId
  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string)
    userId = (decodedToken as { user_id: number }).user_id
    orgId = (decodedToken as { org_id: number }).org_id

    if (!userId || !orgId) {
      setResponseStatus(event, 401)
      throw new CustomError('Unauthorized: Invalid token data', 401)
    }
  } catch {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: Invalid token', 401)
  }

  try {
    const categories = await query(
      `SELECT 
        dc.id, 
        dc.name, 
        dc.org_id, 
        dc.added_by,
        dc.created_at,
        dc.updated_at,
        u.name as added_by_name,
        COUNT(od.id) as document_count
      FROM document_category dc
      LEFT JOIN users u ON dc.added_by = u.user_id
      LEFT JOIN organization_documents od ON dc.id::text = od.file_category AND dc.org_id = od.org_id
      WHERE dc.org_id = $1
      GROUP BY dc.id, dc.name, dc.org_id, dc.added_by, dc.created_at, dc.updated_at, u.name
      ORDER BY dc.name ASC`,
      [orgId]
    )

    setResponseStatus(event, 200)
    return {
      statusCode: 200,
      status: 'success',
      data: categories.rows ?? [],
      message: categories.rows.length
        ? 'Categories fetched successfully'
        : 'No categories found in your organization',
    }
  } catch (err) {
    setResponseStatus(event, 500)
    throw new CustomError('Error fetching categories', 500)
  }
})
