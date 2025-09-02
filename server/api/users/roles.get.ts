import { defineEventHandler, setResponseStatus } from 'h3'
import { query } from '../../utils/db'
import { CustomError } from '../../utils/custom.error'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = event.node.req.headers['authorization']?.split(' ')[1]

  if (!token) {
    throw new CustomError('Unauthorized: No token provided', 401)
  }

  let userId
  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string)
    userId = (decodedToken as { user_id: number }).user_id
  } catch {
    throw new CustomError('Unauthorized: Invalid token', 401)
  }

  const roles = await query(
    'SELECT * FROM public.roles WHERE role_id != 0 ORDER BY role_id ASC',
    [],
  )
  if (!roles?.rows?.length) {
    throw new CustomError('Roles not found', 404)
  }

  // Explicitly set 200 status
  setResponseStatus(event, 200)

  return {
    statusCode: 200,
    data: roles.rows,
    message: 'Roles fetched successfully',
  }
})
