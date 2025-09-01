import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { CustomError } from '../../utils/custom.error'
import { query } from '../../utils/db'
import jwt from 'jsonwebtoken'
import path from 'path'
import {
    S3Client,
    GetObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const bucketName = config.awsBucketName
    const folderName = config.awsFolderName

    if (!bucketName) {
        setResponseStatus(event, 500)
        throw new CustomError('AWS S3 bucket name is not configured', 500)
    }

    const token = event.node.req.headers['authorization']?.split(' ')[1]
    if (!token) {
        setResponseStatus(event, 401)
        throw new CustomError('Unauthorized: No token provided', 401)
    }

    let userId: number
    try {
        const decodedToken = jwt.verify(token, config.jwtToken as string)
        userId = (decodedToken as { user_id: number }).user_id
    } catch (error) {
        setResponseStatus(event, 401)
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
        setResponseStatus(event, 404)
        throw new CustomError('User or organization not found', 404)
    }

    const { org_id, org_name } = userResult.rows[0]
    if (!org_id || !org_name) {
        setResponseStatus(event, 400)
        throw new CustomError('Organization information is incomplete', 400)
    }

    const { artefactId } = await readBody<{ artefactId: number }>(event)
    if (!artefactId) {
        setResponseStatus(event, 400)
        throw new CustomError('Artefact ID is required', 400)
    }

    try {
        // Fetch document details from database
        const documentQuery = `
            SELECT id, name, document_link, content_type, file_category, doc_type
            FROM organization_documents
            WHERE org_id = $1 AND id = $2;
        `
        const documentResult = await query(documentQuery, [org_id, artefactId])

        if (documentResult.rows.length === 0) {
            setResponseStatus(event, 404)
            throw new CustomError('Document not found for the organization', 404)
        }

        const doc = documentResult.rows[0]
        const fileName = doc.name
        const documentLink = doc.document_link


        // If document_link is already a full S3 URL, extract the key from it
        let fileKey
        if (documentLink.startsWith('http')) {
            try {
                const url = new URL(documentLink)
                // The pathname might already be URL encoded, so we extract it as-is first
                const rawPath = url.pathname.substring(1) // Remove leading slash

                // Try to decode it, but if it fails, use the raw path
                try {
                    fileKey = decodeURIComponent(rawPath)
                } catch (decodeError) {
                    fileKey = rawPath
                }

            } catch (err) {
                // Fallback to constructing the path
                const companyName = org_name.toLowerCase().replace(/ /g, '_')
                fileKey = `${folderName}/${companyName}/files/${fileName}`
            }
        } else {
            // For relative paths, construct the full key
            const companyName = org_name.toLowerCase().replace(/ /g, '_')
            if (documentLink.startsWith('/')) {
                const rawPath = documentLink.substring(1)
                try {
                    fileKey = decodeURIComponent(rawPath)
                } catch (decodeError) {
                    fileKey = rawPath
                }
            } else {
                fileKey = `${folderName}/${companyName}/files/${fileName}`
            }
        }

        const s3 = new S3Client({
            region: config.awsRegion,
            credentials: {
                accessKeyId: config.awsAccessKeyId,
                secretAccessKey: config.awsSecretAccessKey,
            },
        })


        // First check if the object exists
        try {
            const headCommand = new HeadObjectCommand({
                Bucket: bucketName,
                Key: fileKey,
            })
            const headResult = await s3.send(headCommand)
        } catch (headError: any) {
            // Try different variations of the file path
            const pathVariations = [
                fileKey, // Original decoded path
                encodeURIComponent(fileKey), // Fully encoded path
                fileKey.replace(/ /g, '%20'), // Only encode spaces
                fileKey.replace(/%20/g, ' '), // Decode only spaces if they were encoded
            ]


            let foundPath = null
            for (const variation of pathVariations) {
                try {
                    const testCommand = new HeadObjectCommand({
                        Bucket: bucketName,
                        Key: variation,
                    })
                    await s3.send(testCommand)
                    foundPath = variation
                    break
                } catch (testError) {
                }
            }

            if (foundPath) {
                fileKey = foundPath // Use the path that worked
            } else {
                if (headError.name === 'NotFound' || headError.$metadata?.httpStatusCode === 404) {
                    setResponseStatus(event, 404)
                    throw new CustomError(`File not found in storage. Tried paths: ${pathVariations.join(', ')}`, 404)
                }
                throw headError // Re-throw original error if it's not a 404
            }
        }

        // Generate signed URL
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
        })

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }) // 1 hour

        // Use the metadata we already fetched
        const fileCategory = doc.file_category || 'no-category'
        const contentType = doc.content_type

        const fileType = path.extname(fileName).substring(1).toLowerCase()

        setResponseStatus(event, 200)
        return {
            statusCode: 200,
            status: 'success',
            fileUrl: signedUrl,
            fileType,
            fileCategory,
            fileName,
            contentType,
            docType: doc.doc_type
        }
    } catch (error: any) {
        if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') {
            setResponseStatus(event, 404)
            throw new CustomError('File not found in storage', 404)
        }

        setResponseStatus(event, 500)
        throw new CustomError(error.message || 'Error generating signed URL', 500)
    }
})
