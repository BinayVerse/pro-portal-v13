import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { CustomError } from '../../../utils/custom.error'
import { query } from '../../../utils/db'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const orgId = getRouterParam(event, 'id')
  const config = useRuntimeConfig()

  const token = event.node.req.headers['authorization']?.split(' ')[1]
  if (!token) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: No token provided', 401)
  }

  let tokenOrgId
  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string)
    tokenOrgId = (decodedToken as { org_id: number }).org_id

    if (!tokenOrgId) {
      setResponseStatus(event, 401)
      throw new CustomError('Unauthorized: Invalid org_id', 401)
    }
  } catch (error) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: Invalid token', 401)
  }

  if (!orgId) {
    setResponseStatus(event, 400)
    throw new CustomError('Please provide a valid organization ID', 400)
  }

  // Ensure user can only access their organization's categories
  if (tokenOrgId.toString() !== orgId) {
    setResponseStatus(event, 403)
    throw new CustomError('Forbidden: Access denied to this organization', 403)
  }

  try {
    const categories = await query(
      `SELECT 
        id, 
        name, 
        org_id, 
        added_by,
        created_at,
        updated_at
      FROM document_category 
      WHERE org_id = $1 
      ORDER BY name ASC`,
      [orgId]
    )

    setResponseStatus(event, 200)
    return {
      statusCode: 200,
      status: 'success',
      data: categories.rows ?? [],
      message: categories.rows.length
        ? 'Categories fetched successfully'
        : 'No categories found for this organization',
    }
  } catch (err) {
    setResponseStatus(event, 500)
    throw new CustomError('Error fetching categories', 500)
  }
})
