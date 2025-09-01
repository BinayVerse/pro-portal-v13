import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { CustomError } from '../../utils/custom.error'
import { query } from '../../utils/db'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  const config = useRuntimeConfig()

  const token = event.node.req.headers['authorization']?.split(' ')[1]
  if (!token) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: No token provided', 401)
  }

  let orgId
  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string)
    orgId = (decodedToken as { org_id: number }).org_id

    if (!orgId) {
      setResponseStatus(event, 401)
      throw new CustomError('Unauthorized: Invalid org_id', 401)
    }
  } catch (error) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: Invalid token', 401)
  }

  if (!userId) {
    setResponseStatus(event, 400)
    throw new CustomError('Please provide a valid user ID', 400)
  }

  try {
    const deleteUserQuery = `
      DELETE FROM users 
      WHERE user_id = $1 AND org_id = $2 
      RETURNING user_id;
    `
    const result = await query(deleteUserQuery, [userId, orgId])

    if (result.rowCount === 0) {
      setResponseStatus(event, 404)
      throw new CustomError('User not found or unauthorized', 404)
    }

    // Successfully deleted
    setResponseStatus(event, 204)
    return null // No content on success
  } catch (err) {
    setResponseStatus(event, 500)
    throw new CustomError('Error deleting user', 500)
  }
})
