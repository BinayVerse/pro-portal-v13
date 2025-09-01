import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { CustomError } from '../../utils/custom.error'
import { query } from '../../utils/db'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { processDocument } from '~/server/utils/processDocument'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Buffer } from 'buffer'
import { Readable } from 'stream'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const bucketName = config.awsBucketName
  const folderName = config.awsFolderName

  if (!bucketName) {
    throw new CustomError('S3 bucket name is not configured', 500)
  }

  const token = event.node.req.headers['authorization']?.split(' ')[1]
  if (!token) {
    throw new CustomError('Unauthorized: No token provided', 401)
  }

  let userId
  try {
    const decodedToken = jwt.verify(token, config.jwtToken as string)
    userId = (decodedToken as { user_id: any }).user_id
  } catch {
    throw new CustomError('Unauthorized: Invalid token', 401)
  }

  try {
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

    const { org_id, org_name } = userResult.rows[0]

    const body = await readBody(event)
    const { selectedFileDetails, category } = body

    if (!selectedFileDetails || !Array.isArray(selectedFileDetails)) {
      throw new CustomError('No files selected for upload', 400)
    }

    if (!category) {
      throw new CustomError('Category is required', 400)
    }

    // Lookup category ID by name
    const categoryQuery = `
      SELECT id FROM document_category
      WHERE name = $1 AND org_id = $2
    `
    const categoryResult = await query(categoryQuery, [category, org_id])

    if (categoryResult.rows.length === 0) {
      throw new CustomError(`Category '${category}' not found for your organization`, 400)
    }

    const categoryId = categoryResult.rows[0].id

    const s3Client = new S3Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    })

    const companyName = org_name.toLowerCase().replace(/ /g, '_')
    const prefix = `${folderName}/${companyName}/files/`

    const uploadedFiles = []
    const documentData = []

    for (const file of selectedFileDetails) {
      const { id, name, webViewLink, mimeType, size, googleAccessToken } = file
      if (!id || !webViewLink) {
        throw new CustomError(`Invalid file data: ${name}`, 400)
      }

      const downloadUrl = googleAccessToken
        ? `https://www.googleapis.com/drive/v3/files/${id}?alt=media`
        : `https://drive.google.com/uc?export=download&id=${id}`

      const axiosConfig: any = {
        method: 'GET',
        url: downloadUrl,
        responseType: 'stream',
        headers: googleAccessToken
          ? { Authorization: `Bearer ${googleAccessToken}` }
          : undefined,
      }

      const response = await axios(axiosConfig)
      if (!response || !response.data) {
        throw new CustomError(`Failed to download file: ${name}`, 500)
      }

      const chunks: Buffer[] = []
      for await (const chunk of response.data as Readable) {
        chunks.push(Buffer.from(chunk))
      }
      const fileBuffer = Buffer.concat(chunks)

      const s3Key = `${prefix}${name}`

      // Upload file to S3 with enhanced error handling
      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: fileBuffer,
            ContentLength: fileBuffer.length,
            ContentType: mimeType,
          })
        )
      } catch (s3Error: any) {
        // Check if it's a path/permission issue
        if (s3Error.Code === 'NoSuchBucket') {
          throw new CustomError(`S3 bucket '${bucketName}' does not exist`, 500)
        } else if (s3Error.Code === 'AccessDenied') {
          throw new CustomError(`Access denied to S3 bucket or path '${prefix}'`, 500)
        } else {
          throw new CustomError(`Failed to upload file '${name}' to S3: ${s3Error.message}`, 500)
        }
      }

      const publicUrl = `https://${bucketName}.s3.${config.awsRegion}.amazonaws.com/${s3Key}`

      // Insert or update in DB
      const existing = await query(
        `SELECT id FROM organization_documents WHERE org_id = $1 AND name = $2`,
        [org_id, name]
      )

      let documentId
      if (existing.rows.length > 0) {
        const result = await query(
          `UPDATE organization_documents
           SET document_link = $1, file_category = $2, status = $3, summary = $4, is_summarized = $5, updated_at = NOW()
           WHERE id = $6 RETURNING id`,
          [publicUrl, categoryId, 'processing', null, false, existing.rows[0].id]
        )
        documentId = result.rows[0].id
      } else {
        const result = await query(
          `INSERT INTO organization_documents
           (org_id, doc_type, document_link, status, file_category, name, content_type, file_size, summary, is_summarized)
           VALUES ($1, 'gdrive', $2, 'processing', $3, $4, $5, $6, null, false) RETURNING id`,
          [
            org_id,
            publicUrl,
            categoryId,
            name,
            mimeType,
            size ? parseInt(size.replace(' KB', '')) * 1024 : null,
          ]
        )
        documentId = result.rows[0].id
      }

      documentData.push({
        id: documentId,
        name,
        type: 'document',
        link: publicUrl,
      })

      uploadedFiles.push({
        name,
        publicUrl,
        contentType: mimeType,
        size,
        type: file.type,
      })
    }

    if (documentData.length > 0) {
      await processDocument(bucketName, folderName, org_name, org_id, userId, documentData, token)
    }

    setResponseStatus(event, 201)
    return {
      statusCode: 201,
      status: 'success',
      message: 'Files uploaded successfully to S3',
      files: uploadedFiles,
    }
  } catch (error: any) {
    throw new CustomError(error.message || 'Failed to upload files', 500)
  }
})
