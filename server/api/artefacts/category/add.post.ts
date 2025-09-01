import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { CustomError } from '../../../utils/custom.error'
import { createCategoryValidation } from '../../../utils/category-validations'
import { query } from '../../../utils/db'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const params = await readBody(event)

  const token = event.node.req.headers['authorization']?.split(' ')[1]
  if (!token) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: No token provided', 401)
  }

  let userId: number
  let tokenOrgId: number

  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string) as { 
      user_id: number; 
      org_id: number 
    }
    userId = decodedToken.user_id
    tokenOrgId = decodedToken.org_id

    if (!userId || !tokenOrgId) {
      setResponseStatus(event, 401)
      throw new CustomError('Unauthorized: Invalid token data', 401)
    }
  } catch (error) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: Invalid token', 401)
  }

  // Validate input
  let categoryDetails
  try {
    categoryDetails = await createCategoryValidation.parseAsync(params)
  } catch (validationError: any) {
    setResponseStatus(event, 400)
    throw new CustomError(validationError.message || 'Invalid input', 400)
  }

  const { name } = categoryDetails
  // Use org_id from token instead of request body for security
  const orgId = tokenOrgId

  try {
    // Check for duplicate category name in the same organization
    const duplicateCheck = await query(
      `SELECT id FROM document_category WHERE name = $1 AND org_id = $2`,
      [name, orgId]
    )

    if (duplicateCheck.rows.length > 0) {
      setResponseStatus(event, 409)
      throw new CustomError('Category with this name already exists in your organization', 409)
    }

    // Insert new category
    const insertCategoryQuery = `
      INSERT INTO document_category (name, org_id, added_by) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, org_id, added_by, created_at, updated_at;
    `
    const result = await query(insertCategoryQuery, [name, orgId, userId])

    const newCategory = result.rows[0]

    setResponseStatus(event, 201)
    return {
      statusCode: 201,
      status: 'success',
      message: 'Category created successfully',
      data: newCategory,
    }
  } catch (err: any) {
    if (err instanceof CustomError) {
      throw err
    }
    setResponseStatus(event, 500)
    throw new CustomError('Error creating category', 500)
  }
})
