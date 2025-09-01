import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { CustomError } from '../../utils/custom.error'
import { createUserValidation } from '../../utils/validations'
import { query } from '../../utils/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {
  generateRandomPassword,
  generateResetLink,
  sendUserAdditionMail,
  sendWelcomeMail,
} from '../helper'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const params = await readBody(event)

  const token = event.node.req.headers['authorization']?.split(' ')[1]
  if (!token) {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: No token provided', 401)
  }

  let userId: number
  let currentUser
  let orgDetail

  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string) as { user_id: number }
    userId = decodedToken.user_id

    const userResult = await query(
      `SELECT user_id, name, email, org_id FROM users WHERE user_id = $1`,
      [userId],
    )
    if (!userResult.rows.length) {
      setResponseStatus(event, 404)
      throw new CustomError('User not found', 404)
    }

    currentUser = userResult.rows[0]

    const orgResult = await query(
      `SELECT org_id, org_name, qr_code FROM organizations WHERE org_id = $1`,
      [currentUser.org_id],
    )
    if (!orgResult.rows.length) {
      setResponseStatus(event, 404)
      throw new CustomError('Organization not found', 404)
    }

    orgDetail = orgResult.rows[0]
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      setResponseStatus(event, 401)
      throw new CustomError('Unauthorized: Invalid token', 401)
    }
    setResponseStatus(event, 500)
    throw new CustomError('Error fetching user or organization details', 500)
  }

  // Validate input
  let userDetails
  try {
    userDetails = await createUserValidation.parseAsync(params)
  } catch (validationError: any) {
    setResponseStatus(event, 400)
    throw new CustomError(validationError.message || 'Invalid input', 400)
  }

  const { name, email, contact_number, role_id } = userDetails
  const appLink = `${config.public.appUrl}/login`
  const password = generateRandomPassword()

  // Check for duplicates in the same org
  const duplicateCheck = await query(
    `SELECT user_id FROM users WHERE (email = $1 OR contact_number = $2) AND org_id = $3`,
    [email, contact_number, orgDetail.org_id],
  )

  if (duplicateCheck.rows.length > 0) {
    setResponseStatus(event, 409)
    throw new CustomError('Email or Mobile Number already exists in this organization', 409)
  }

  // Admin restriction check
  if (role_id == '1') {
    const adminCheck = await query(
      `SELECT o.org_name FROM users u
       JOIN organizations o ON u.org_id = o.org_id
       WHERE u.email = $1 AND u.role_id = '1' AND u.org_id != $2`,
      [email, orgDetail.org_id],
    )

    if (adminCheck.rows.length > 0) {
      setResponseStatus(event, 409)
      throw new CustomError(
        `Cannot assign the admin role to this user, as the user is already an admin of ${adminCheck.rows[0].org_name}`,
        409,
      )
    }
  }

  // Prepare insert query
  let insertUserQuery = `
    INSERT INTO users (name, email, contact_number, role_id, org_id, added_by) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING user_id;
  `
  let values = [name, email, contact_number, role_id, orgDetail.org_id, userId]

  if (role_id == '1') {
    const hashedPassword = await bcrypt.hash(password, 10)
    insertUserQuery = `
      INSERT INTO users (name, email, password, contact_number, role_id, org_id, added_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING user_id;
    `
    values = [name, email, hashedPassword, contact_number, role_id, orgDetail.org_id, userId]
  }

  // Generate signed QR URL
  const qrKey = new URL(orgDetail.qr_code).pathname.slice(1)
  const s3 = new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  })

  const signedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: config.awsBucketName,
      Key: qrKey,
    }),
    { expiresIn: 604800 },
  )

  try {
    const result = await query(insertUserQuery, values)
    const newUserId = result.rows[0].user_id

    // Email notifications
    if (role_id == '1') {
      const { resetLink } = await generateResetLink(email, config.public.appUrl)
      await sendWelcomeMail(name, email, password, appLink, resetLink)
    } else {
      await sendUserAdditionMail(name, email, signedUrl)
    }

    setResponseStatus(event, 201) // User created
    return {
      statusCode: 201,
      status: 'success',
      message: 'User created successfully',
      userId: newUserId,
    }
  } catch (err) {
    if (err instanceof CustomError) {
      setResponseStatus(event, err.statusCode)
      return {
        statusCode: err.statusCode,
        status: 'error',
        message: err.message,
      }
    }
    setResponseStatus(event, 500)
    throw new CustomError('Error creating user', 500)
  }
})
