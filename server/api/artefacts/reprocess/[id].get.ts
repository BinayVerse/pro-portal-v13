import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { CustomError } from '../../../utils/custom.error'
import { query } from '../../../utils/db'
import jwt from 'jsonwebtoken'
import { processDocument } from '~/server/utils/processDocument'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const bucketName = config.awsBucketName
  const folderName = config.awsFolderName

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

  const artefactId = getRouterParam(event, 'id')
  if (!artefactId) {
    throw new CustomError('Artefact ID is required', 400)
  }

  try {
    // Get user's org_id and org_name
    const userResult = await query(
      `SELECT u.org_id, o.org_name
       FROM users u
       INNER JOIN organizations o ON u.org_id = o.org_id
       WHERE u.user_id = $1;`,
      [userId]
    )

    if (userResult.rows.length === 0) {
      throw new CustomError('User or organization not found', 404)
    }

    const { org_id, org_name } = userResult.rows[0]

    // Check if the artefact exists and belongs to user's org
    const artefactResult = await query(
      `SELECT id, name, doc_type, document_link, status
       FROM organization_documents
       WHERE org_id = $1 AND id = $2;`,
      [org_id, artefactId]
    )

    if (artefactResult.rows.length === 0) {
      throw new CustomError('Artefact not found or access denied', 404)
    }

    const artefact = artefactResult.rows[0]

    // Check if artefact can be reprocessed (has a document link)
    if (!artefact.document_link) {
      throw new CustomError('Artefact cannot be reprocessed - no document link found', 400)
    }

    // Update artefact status to "processing" and clear summary data
    await query(
      `UPDATE organization_documents
       SET status = 'processing', summary = NULL, is_summarized = FALSE, updated_at = NOW()
       WHERE id = $1 AND org_id = $2;`,
      [artefactId, org_id]
    )

    // Prepare document data for reprocessing
    const documentData = [{
      id: artefact.id.toString(),
      name: artefact.name,
      type: 'document',
      link: artefact.document_link,
    }]

    // Trigger re-processing using the existing processDocument utility
    await processDocument(bucketName, folderName, org_name, org_id, userId, documentData, token)

    setResponseStatus(event, 200)
    return {
      statusCode: 200,
      status: 'success',
      message: 'Artefact re-processing started successfully',
      data: {
        id: artefact.id,
        name: artefact.name,
        status: 'processing'
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
      message: 'Failed to reprocess artefact',
    }
  }
})
