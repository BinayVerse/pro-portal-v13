import { defineEventHandler, readBody, getRouterParam, setResponseStatus } from 'h3'
import { CustomError } from '../../utils/custom.error'
import { query } from '../../utils/db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
  generateRandomPassword,
  generateResetLink,
  sendUserAdditionMail,
  sendWelcomeMail,
} from '../helper'
import { isPersonalEmail, personalEmailDomains } from '~/utils'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export default defineEventHandler(async (event) => {
  const params = await readBody(event)
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
  } catch {
    setResponseStatus(event, 401)
    throw new CustomError('Unauthorized: Invalid token', 401)
  }

  if (!userId) {
    setResponseStatus(event, 400)
    throw new CustomError('User ID is required', 400)
  }

  try {
    const fetchUserQuery = `
      SELECT users.*, organizations.org_name, organizations.qr_code 
      FROM users 
      LEFT JOIN organizations ON users.org_id = organizations.org_id 
      WHERE users.user_id = $1 AND users.org_id = $2;
    `
    const userResult = await query(fetchUserQuery, [userId, orgId])

    if (userResult.rows.length === 0) {
      setResponseStatus(event, 404)
      throw new CustomError('User not found or unauthorized', 404)
    }

    const currentUser = userResult.rows[0]
    const appLink = `${config.public.appUrl}/login`
    const updates: string[] = []
    const values: any[] = []

    if (params.email && params.email !== currentUser.email) {
      const isCurrentPersonal = isPersonalEmail(currentUser.email, personalEmailDomains)
      const isNewPersonal = isPersonalEmail(params.email, personalEmailDomains)

      if (!isCurrentPersonal && isNewPersonal) {
        setResponseStatus(event, 403)
        throw new CustomError('Cannot change a domain email to a personal email address', 403)
      }

      const emailCheckQuery = `
        SELECT user_id FROM users 
        WHERE email = $1 AND org_id = $2 AND user_id != $3;
      `
      const emailCheckResult = await query(emailCheckQuery, [params.email, orgId, userId])

      if (emailCheckResult.rows.length > 0) {
        setResponseStatus(event, 409)
        throw new CustomError('Email is already in use within this organization', 409)
      }

      updates.push(`email = $${updates.length + 1}`)
      values.push(params.email)
    }

    if (params.contact_number && params.contact_number !== currentUser.contact_number) {
      const contactCheckQuery = `
        SELECT user_id FROM users 
        WHERE contact_number = $1 AND org_id = $2 AND user_id != $3;
      `
      const contactCheckResult = await query(contactCheckQuery, [
        params.contact_number,
        orgId,
        userId,
      ])

      if (contactCheckResult.rows.length > 0) {
        setResponseStatus(event, 409)
        throw new CustomError('Contact number is already in use within this organization', 409)
      }

      updates.push(`contact_number = $${updates.length + 1}`)
      values.push(params.contact_number)
    }

    if (params.name) {
      updates.push(`name = $${updates.length + 1}`)
      values.push(params.name)
    }
    if (params.role_id) {
      updates.push(`role_id = $${updates.length + 1}`)
      values.push(params.role_id)
    }
    if (params.primary_contact !== undefined) {
      updates.push(`primary_contact = $${updates.length + 1}`)
      values.push(params.primary_contact)
    }

    if (params.role_id && params.role_id == '1' && currentUser.role_id != '1') {
      const checkAdminQuery = `
        SELECT o.org_name FROM users u
        JOIN organizations o ON u.org_id = o.org_id
        WHERE u.email = $1 AND u.role_id = '1' AND u.org_id != $2;
      `
      const adminCheckResult = await query(checkAdminQuery, [params.email, orgId])

      if (adminCheckResult.rows.length > 0) {
        setResponseStatus(event, 409)
        throw new CustomError(
          `Cannot assign the admin role to the user, as the user is already an admin of ${adminCheckResult.rows[0].org_name}`,
          409,
        )
      }

      const password = generateRandomPassword()
      const hashedPassword = await bcrypt.hash(password, 10)
      updates.push(`password = $${updates.length + 1}`)
      values.push(hashedPassword)

      const { resetLink } = await generateResetLink(currentUser.email, config.public.appUrl)
      await sendWelcomeMail(currentUser.name, currentUser.email, password, appLink, resetLink)
    } else if (currentUser.role_id == '1' && params.role_id != '1') {
      updates.push(`password = NULL`)
      const qrUrl = currentUser.qr_code as string
      const qrKey = new URL(qrUrl).pathname.slice(1)

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

      await sendUserAdditionMail(currentUser.name, currentUser.email, signedUrl)
    }

    if (updates.length === 0) {
      setResponseStatus(event, 400)
      throw new CustomError('No fields to update', 400)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)
    values.push(orgId)

    const updateUserQuery = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE user_id = $${values.length - 1} AND org_id = $${values.length}
      RETURNING user_id;
    `

    const result = await query(updateUserQuery, values)

    if (result.rowCount === 0) {
      setResponseStatus(event, 404)
      throw new CustomError('User not found or unauthorized', 404)
    }

    setResponseStatus(event, 200)
    return {
      statusCode: 201,
      status: 'success',
      message: 'User updated successfully',
      userId: result.rows[0].user_id,
    }
  } catch (err: any) {
    console.error('Error updating user:', err)
    if (err instanceof CustomError) {
      setResponseStatus(event, err.statusCode)
      return {
        statusCode: err.statusCode,
        status: 'error',
        message: err.message,
      }
    }
    setResponseStatus(event, 500)
    throw new CustomError(err.message || 'Error updating user', 500)
  }
})
