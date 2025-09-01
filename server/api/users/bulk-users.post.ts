import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { CustomError } from '../../utils/custom.error'
import { getClient, query } from '../../utils/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {
  generateRandomPassword,
  generateResetLink,
  sendUserAdditionMail,
  sendWelcomeMail,
} from '../helper'

const config = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  let client

  try {
    const authHeader = event.node.req.headers['authorization']
    if (!authHeader) {
      setResponseStatus(event, 401)
      throw new CustomError('Unauthorized: No token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      setResponseStatus(event, 401)
      throw new CustomError('Unauthorized: Invalid authorization header format', 401)
    }

    const decodedToken = jwt.verify(token, config.jwtToken) as { user_id: number }
    const userId = decodedToken.user_id

    const userResult = await query(
      `SELECT user_id, name, email, org_id FROM users WHERE user_id = $1`,
      [userId],
    )
    if (userResult.rows.length === 0) {
      setResponseStatus(event, 404)
      throw new CustomError('User not found', 404)
    }

    const orgResult = await query(
      `SELECT org_id, org_name, qr_code FROM organizations WHERE org_id = $1`,
      [userResult.rows[0].org_id],
    )
    if (orgResult.rows.length === 0) {
      setResponseStatus(event, 404)
      throw new CustomError('Organization not found', 404)
    }

    const orgDetail = orgResult.rows[0]
    const body = await readBody(event)

    if (!Array.isArray(body)) {
      setResponseStatus(event, 400)
      throw new CustomError('Expected an array of users', 400)
    }

    client = await getClient()
    await client.query('BEGIN')

    const successfulUsers: any[] = []
    const failedUsers: any[] = []

    for (let rowIndex = 0; rowIndex < body.length; rowIndex++) {
      const row = body[rowIndex]
      const name = row.Name?.trim()
      const email = row.Email?.trim()
      const contactNumber = row['Whatsapp Number']?.trim()
      const role = row.Role?.trim().toLowerCase()
      const roleId = role === 'user' ? 2 : 1
      const rowErrors: any[] = []

      try {
        if (roleId === 1) {
          const adminCheck = await query(
            `SELECT o.org_name FROM users u JOIN organizations o ON u.org_id = o.org_id WHERE u.email = $1 AND u.role_id = 1`,
            [email],
          )
          if (adminCheck.rows.length > 0) {
            rowErrors.push({
              field: 'Email',
              message: `Cannot assign the admin role, already admin of ${adminCheck.rows[0].org_name}`,
            })
            failedUsers.push({ Row: rowIndex + 1, errors: rowErrors })
            continue
          }
        }

        const duplicateCheck = await client.query(
          `SELECT email, contact_number FROM users WHERE (email = $1 OR contact_number = $2) AND org_id = $3`,
          [email, contactNumber, orgDetail.org_id],
        )

        duplicateCheck.rows.forEach((existingUser: any) => {
          if (existingUser.email === email) {
            rowErrors.push({
              field: 'Email',
              message: `${email} is already in use in this organization`,
            })
          }
          if (existingUser.contact_number === contactNumber) {
            rowErrors.push({
              field: 'Whatsapp Number',
              message: `${contactNumber} is already in use in this organization`,
            })
          }
        })

        if (rowErrors.length > 0) {
          failedUsers.push({ Row: rowIndex + 1, errors: rowErrors })
          continue
        }

        const password = generateRandomPassword()
        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await client.query(
          `INSERT INTO users (name, email, contact_number, role_id, password, org_id)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`,
          [name, email, contactNumber, roleId, hashedPassword, orgDetail.org_id],
        )

        successfulUsers.push({
          userId: result.rows[0].user_id,
          email,
          name,
          contact_number: contactNumber,
          role_id: roleId,
          password,
        })
      } catch (err: any) {
        rowErrors.push({ field: 'Database', message: `Database error: ${err.message}` })
        failedUsers.push({ Row: rowIndex + 1, errors: rowErrors })
      }
    }

    if (failedUsers.length > 0) {
      await client.query('ROLLBACK')
      setResponseStatus(event, 400) // Partial success → treated as a bad request
      return {
        status: false,
        message: 'Error occurred during user creation',
        errors: failedUsers,
      }
    }

    await client.query('COMMIT')

    const appLink = `${config.public.appUrl}/login`
    for (const user of successfulUsers) {
      try {
        if (user.role_id === 1) {
          const { resetLink } = await generateResetLink(user.email, config.public.appUrl)
          await sendWelcomeMail(user.name, user.email, user.password, appLink, resetLink)
        } else {
          await sendUserAdditionMail(user.name, user.email, orgDetail.qr_code)
        }
      } catch (err: any) {
        console.error(`Failed to send email to ${user.email}:`, err.message)
      }
    }

    setResponseStatus(event, 201) // POST success
    return {
      statusCode: 201,
      status: 'success',
      message: `${successfulUsers.length} users successfully added`,
      data: successfulUsers,
      errors: [],
    }
  } catch (error: any) {
    if (client) await client.query('ROLLBACK')
    console.error('Handler Error:', error)

    if (error instanceof CustomError) {
      setResponseStatus(event, error.statusCode)
      return {
        statusCode: error.statusCode,
        status: 'error',
        message: error.message,
      }
    }

    setResponseStatus(event, 500)
    return {
      status: false,
      message: 'An unexpected error occurred',
    }
  } finally {
    if (client) client.release()
  }
})
