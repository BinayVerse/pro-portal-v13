import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { CustomError } from '../../utils/custom.error'
import { query } from '../../utils/db'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const token = event.node.req.headers['authorization']?.split(' ')[1]
  if (!token) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: No token provided', 401)
  }

  let userId: number
  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string)
    userId = (decodedToken as { user_id: number }).user_id
  } catch (error) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: Invalid token', 401)
  }

  const userQuery = `
    SELECT u.org_id, o.org_name
    FROM users u
    INNER JOIN organizations o ON u.org_id = o.org_id
    WHERE u.user_id = $1;
  `
  const userResult = await query(userQuery, [userId])

  if (userResult.rows.length === 0) {
    setResponseStatus(event, 404)
    throw new CustomError('User or organization not found', 404)
  }

  const { org_id } = userResult.rows[0]

  const { fileName } = await readBody<{ fileName: string }>(event)
  
  if (!fileName) {
    setResponseStatus(event, 400)
    throw new CustomError('File name is required', 400)
  }

  try {
    // Clean filename to match upload logic
    const cleanedFileName = fileName.replace(/\s+/g, '_')
    
    // Check if file exists and get category name
    const existingFileQuery = await query(
      `SELECT od.id, od.name, od.file_category, od.updated_at, dc.name as category_name
       FROM organization_documents od
       LEFT JOIN document_category dc ON od.file_category = dc.id
       WHERE od.org_id = $1 AND od.name = $2`,
      [org_id, cleanedFileName]
    )

    const exists = existingFileQuery.rows.length > 0

    setResponseStatus(event, 200)
    return {
      statusCode: 200,
      status: 'success',
      exists,
      fileInfo: exists ? {
        id: existingFileQuery.rows[0].id,
        name: existingFileQuery.rows[0].name,
        category: existingFileQuery.rows[0].category_name || 'Uncategorized',
        lastUpdated: existingFileQuery.rows[0].updated_at
      } : null
    }
  } catch (error: any) {
    setResponseStatus(event, 500)
    throw new CustomError(error.message || 'Failed to check file existence', 500)
  }
})
