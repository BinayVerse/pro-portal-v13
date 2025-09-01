import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { CustomError } from '../../utils/custom.error'
import { uploadBulkUserValidation } from '~/server/utils/validations'

interface User {
  Name: string
  Email: string
  'Whatsapp Number': string
  Role: string
  error?: string
  rowNumber?: number
  rowIndex?: number
  invalidFields?: { field: string; message: string }[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!Array.isArray(body)) {
    setResponseStatus(event, 400)
    throw new CustomError('Expected an array of users', 400)
  }

  const emailSet = new Set<string>()
  const contactNumberSet = new Set<string>()
  const failedUsers: User[] = []
  let hasErrorOccurred = false

  const expectedKeys = ['Name', 'Email', 'Whatsapp Number', 'Role']
  const headers = Object.keys(body[0])

  const unexpectedHeaders = headers.filter((header) => !expectedKeys.includes(header))
  if (unexpectedHeaders.length > 0) {
    setResponseStatus(event, 422)
    return {
      status: false,
      errors: unexpectedHeaders.map((header) => ({
        column: header,
        error: `Invalid headers found: ${unexpectedHeaders.join(', ')}`,
      })),
    }
  }

  body.forEach((row, index) => {
    const rowErrors: { field: string; message: string }[] = []
    const rowNumber = index + 1
    const rowIndex = index

    // Zod safeParse instead of Joi validate
    const result = uploadBulkUserValidation.safeParse(row)

    if (!result.success) {
      // Collect Zod errors
      result.error.errors.forEach((err) => {
        rowErrors.push({
          field: err.path[0]?.toString() || 'unknown',
          message: err.message,
        })
      })
    } else {
      // Valid row data
      const { Name, Email, 'Whatsapp Number': contactNumber } = result.data

      // Check duplicate emails
      if (Email) {
        const normalizedEmail = Email.toLowerCase()
        if (emailSet.has(normalizedEmail)) {
          rowErrors.push({
            field: 'Email',
            message: `Duplicate Email: ${Email} already present in CSV File`,
          })
        } else {
          emailSet.add(normalizedEmail)
        }
      }

      // Check duplicate WhatsApp numbers
      if (contactNumber) {
        if (contactNumberSet.has(contactNumber)) {
          rowErrors.push({
            field: 'Whatsapp Number',
            message: `Duplicate Whatsapp Number: ${contactNumber} already present in CSV File`,
          })
        } else {
          contactNumberSet.add(contactNumber)
        }
      }
    }

    if (rowErrors.length > 0) {
      failedUsers.push({ ...row, rowNumber, rowIndex, invalidFields: rowErrors })
      hasErrorOccurred = true
    }
  })

  if (hasErrorOccurred) {
    setResponseStatus(event, 422)
  } else {
    setResponseStatus(event, 200)
  }

  return {
    statusCode: hasErrorOccurred ? 422 : 200,
    status: !hasErrorOccurred,
    message: hasErrorOccurred ? 'Validation failed for some users' : 'CSV processed successfully',
    errors: failedUsers,
  }
})
