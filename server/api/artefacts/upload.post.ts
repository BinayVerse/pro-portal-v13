import { defineEventHandler, setResponseStatus } from 'h3'
import formidable from 'formidable'
import { CustomError } from '../../utils/custom.error'
import { query } from '../../utils/db'
import jwt from 'jsonwebtoken'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { processDocument } from '~/server/utils/processDocument'
import fs from 'fs'
import mime from 'mime-types'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const bucketName = config.awsBucketName
    const folderName = config.awsFolderName

    if (!bucketName) {
      throw new CustomError('AWS S3 bucket name is not configured', 500)
    }

  const token = event.node.req.headers['authorization']?.split(' ')[1]
  if (!token) {
    throw new CustomError('Unauthorized: No token provided', 401)
  }

  let userId
  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string)
    userId = (decodedToken as { user_id: any }).user_id
  } catch (error) {
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
    throw new CustomError('User or organization not found', 404)
  }

  const { org_name, org_id } = userResult.rows[0]
  const companyName = org_name.toLowerCase().replace(/ /g, '_')
  const prefix = `${folderName}/${companyName}/files/`

  const s3Client = new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  })

  try {
    const form = formidable({
      multiples: false,
      maxFileSize: 20 * 1024 * 1024 // 20MB limit to match frontend
    })

    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err)
        resolve({ fields, files })
      })
    })

    if (!files.file) {
      throw new CustomError('No file uploaded', 400)
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file
    if (!uploadedFile?.originalFilename) {
      throw new CustomError('Invalid file uploaded', 400)
    }

    // Get form fields
    const category = String(fields.category || '')
    const description = String(fields.description || '')

    if (!category) {
      throw new CustomError('Category is required', 400)
    }

    // Validate file size (20MB limit)
    const maxSize = 20 * 1024 * 1024
    if (uploadedFile.size > maxSize) {
      throw new CustomError(`The file "${uploadedFile.originalFilename}" exceeds 20MB size limit.`, 400)
    }

    const filePath = uploadedFile.filepath
    let fileName = uploadedFile.originalFilename.replace(/\s+/g, '_')

    let fileBuffer
    try {
      fileBuffer = fs.readFileSync(filePath)
    } catch (err) {
      throw new CustomError('Failed to read uploaded file', 500)
    }

    const fileMimeType = uploadedFile.mimetype || mime.lookup(fileName) || 'application/octet-stream'
    const destinationKey = `${prefix}${fileName}`

    // Check if file already exists
    const existingFileQuery = await query(
      `SELECT id FROM organization_documents WHERE org_id = $1 AND name = $2`,
      [org_id, fileName]
    )
    const existingFile = existingFileQuery.rows.length > 0 ? existingFileQuery.rows[0] : null

    // Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: destinationKey,
      Body: fileBuffer,
      ContentType: fileMimeType,
    }))

    const publicUrl = `https://${bucketName}.s3.${config.awsRegion}.amazonaws.com/${destinationKey}`

    // Find category ID
    let categoryId = null
    if (category && category !== 'Uncategorized') {
      const categoryQuery = await query(
        `SELECT id FROM document_category WHERE name = $1 AND org_id = $2`,
        [category, org_id]
      )
      if (categoryQuery.rows.length > 0) {
        categoryId = categoryQuery.rows[0].id
      } else {
        // Create category if it doesn't exist
        const newCategoryResult = await query(
          `INSERT INTO document_category (name, org_id, added_by) VALUES ($1, $2, $3) RETURNING id`,
          [category, org_id, userId]
        )
        categoryId = newCategoryResult.rows[0].id
      }
    }

    let documentId: number
    if (existingFile) {
      // Update existing file
      const updateResult = await query(
        `UPDATE organization_documents
        SET document_link = $1, status = $2, summary = $3, is_summarized = $4, updated_at = NOW(), file_category = $5, doc_type = 'document', content_type = $6, file_size = $7, description = $8, added_by = $9
        WHERE id = $10
        RETURNING id`,
        [publicUrl, 'processing', null, false, categoryId, fileMimeType, parseInt(uploadedFile.size.toString(), 10), description || null, userId, existingFile.id]
      )
      documentId = updateResult.rows[0].id
    } else {
      // Insert new file
      const insertFileResult = await query(
        `INSERT INTO organization_documents (org_id, doc_type, document_link, status, file_category, name, content_type, file_size, summary, is_summarized, description, added_by)
        VALUES ($1, 'document', $2, 'processing', $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          org_id,
          publicUrl,
          categoryId,
          fileName,
          fileMimeType,
          parseInt(uploadedFile.size.toString(), 10),
          null,
          false,
          description || null,
          userId,
        ]
      )
      documentId = insertFileResult.rows[0].id
    }

    // Process the document
    await processDocument(bucketName, folderName, org_name, org_id, userId, [
      { id: String(documentId), name: fileName, type: 'document', link: publicUrl },
    ], token)

    setResponseStatus(event, 201)
    return {
      statusCode: 201,
      status: 'success',
      message: existingFile ? 'Artefact updated successfully' : 'Artefact uploaded successfully',
      data: {
        id: documentId,
        name: fileName,
        description: description || 'No description provided',
        category: category,
        type: getFileType(fileName),
        size: formatFileSize(uploadedFile.size),
        status: 'processing',
        uploadedBy: 'Current User',
        lastUpdated: new Date().toISOString(),
        artefact: fileName,
        publicUrl,
        contentType: fileMimeType,
      },
    }
  } catch (error: any) {
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
      statusCode: 500,
      status: 'error',
      message: error.message || 'Failed to process request',
    }
  }
  } catch (outerError: any) {
    setResponseStatus(event, 500)
    return {
      statusCode: 500,
      status: 'error',
      message: 'Unexpected server error',
    }
  }
})

function getFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    txt: 'TXT',
    csv: 'CSV',
    md: 'Markdown',
    png: 'Image',
    jpg: 'Image',
    jpeg: 'Image',
  }
  return typeMap[extension || ''] || 'Unknown'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'kB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
