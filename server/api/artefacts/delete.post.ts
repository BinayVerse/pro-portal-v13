import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { CustomError } from '../../utils/custom.error'
import { query } from '../../utils/db'
import jwt from 'jsonwebtoken'
import { deleteDocument } from '~/server/utils/deleteDocument'
import { S3Client, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
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
    userId = (decodedToken as { user_id: number }).user_id
  } catch {
    throw new CustomError('Unauthorized: Invalid token', 401)
  }

  const { artefactId, artefactName } = await readBody<{ 
    artefactId?: number
    artefactName?: string 
  }>(event)

  if (!artefactId && !artefactName) {
    throw new CustomError('Artefact ID or name is required', 400)
  }

  try {
    const userQuery = `
      SELECT u.org_id, o.org_name
      FROM users u
      INNER JOIN organizations o ON u.org_id = o.org_id
      WHERE u.user_id = $1;
    `
    const userResult = await query(userQuery, [userId])

    if (!userResult.rows.length) {
      throw new CustomError('User or organization not found', 404)
    }

    const { org_name, org_id } = userResult.rows[0]
    if (!org_name) {
      throw new CustomError('Organization information is incomplete', 400)
    }

    // Find the document by ID or name
    let checkDocQuery = ''
    let queryParams: any[] = []

    if (artefactId) {
      checkDocQuery = `
        SELECT id, name, document_link, status FROM organization_documents 
        WHERE org_id = $1 AND id = $2;
      `
      queryParams = [org_id, artefactId]
    } else {
      checkDocQuery = `
        SELECT id, name, document_link, status FROM organization_documents 
        WHERE org_id = $1 AND name = $2;
      `
      queryParams = [org_id, artefactName]
    }

    const docResult = await query(checkDocQuery, queryParams)

    if (!docResult.rows.length) {
      throw new CustomError('Artefact not found in database', 404)
    }

    const documentId = docResult.rows[0].id
    const documentName = docResult.rows[0].name
    const documentLink = docResult.rows[0].document_link
    const documentDeleteAction = docResult.rows[0].status === 'processed'

    const s3 = new S3Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    })

    // Delete from S3 if it's a valid S3 URL
    if (documentLink && typeof documentLink === 'string' && documentLink.startsWith('https://')) {
      const companyName = org_name.toLowerCase().replace(/ /g, '_')
      const fileKey = `${folderName}/${companyName}/files/${documentName}`

      try {
        await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: fileKey }))
        await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: fileKey }))
      } catch (err: any) {
        if (err.name !== 'NotFound') {
          throw new CustomError('Failed to delete file from S3', 500)
        }
        // If file doesn't exist in S3, proceed anyway
      }
    }

    // Delete from database
    await query(`DELETE FROM organization_documents WHERE id = $1;`, [documentId])

    // Delete from vector database if document was processed
    if (documentDeleteAction) {
      try {
        await deleteDocument(bucketName, folderName, org_name, org_id, [
          {
            id: documentId.toString(),
            name: documentName,
            link: documentLink,
            type: 'document'
          },
        ], token)
      } catch (vectorError) {
        // Log but don't fail the operation if vector deletion fails
        // The document is already deleted from DB and S3
      }
    }

    setResponseStatus(event, 200)
    return {
      statusCode: 200,
      status: 'success',
      message: 'Artefact deleted successfully',
      data: {
        id: documentId,
        name: documentName
      }
    }
  } catch (err: any) {
    if (err instanceof CustomError) {
      setResponseStatus(event, err.statusCode)
      return {
        statusCode: err.statusCode,
        status: 'error',
        message: err.message,
      }
    }
    
    setResponseStatus(event, 500)
    return {
      statusCode: 500,
      status: 'error',
      message: 'Failed to delete artefact',
    }
  }
})
