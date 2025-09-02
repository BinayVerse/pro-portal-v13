import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { CustomError } from '../../utils/custom.error'
import { query } from '../../utils/db'
import jwt from 'jsonwebtoken'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

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

  const { timezone: clientTimezone } = await readBody(event)
  const userTimezone = clientTimezone || 'UTC'

  try {
    const userResult = await query(
      `SELECT u.org_id, o.org_name
      FROM users u
      INNER JOIN organizations o ON u.org_id = o.org_id
      WHERE u.user_id = $1;
      `,
      [userId]
    )

    if (!userResult.rows.length) {
      throw new CustomError('User or organization not found', 404)
    }

    const { org_id } = userResult.rows[0]

    // Fetch documents with category information and user who added them
    const documentResults = await query(
      `SELECT
          d.id, d.name, d.doc_type, d.document_link, d.content_type,
          d.file_size, d.status, d.updated_at, d.file_category, d.description,
          d.is_summarized AS summarized, d.summary, d.added_by,
          COALESCE(c.name, 'Uncategorized') AS category_name,
          COALESCE(u.name, 'Unknown User') AS uploaded_by_name
        FROM organization_documents d
        LEFT JOIN document_category c
          ON d.file_category IS NOT NULL AND d.file_category::text = c.id::text
        LEFT JOIN users u ON d.added_by = u.user_id
        WHERE d.org_id = $1
        ORDER BY d.updated_at DESC;
        `,
      [org_id]
    )

    // Calculate stats dynamically
    const documents = documentResults.rows
    const totalArtefacts = documents.length
    const processedArtefacts = documents.filter((doc: any) => doc.status === 'processed').length
    const uniqueCategories = new Set(documents.map((doc: any) => doc.category_name || 'Uncategorized'))
    const totalCategories = uniqueCategories.size
    
    // Calculate total size in bytes, then format
    const totalSizeBytes = documents.reduce((sum: number, doc: any) => {
      return sum + (doc.file_size || 0)
    }, 0)
    
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'kB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const getFileType = (contentType: string, fileName: string): string => {
      if (contentType) {
        if (contentType.includes('pdf')) return 'PDF'
        if (contentType.includes('word') || contentType.includes('document')) return 'Word'
        if (contentType.includes('text/plain')) return 'TXT'
        if (contentType.includes('text/csv')) return 'CSV'
        if (contentType.includes('text/markdown')) return 'Markdown'
        if (contentType.includes('image')) return 'Image'
      }
      
      // Fallback to file extension
      const extension = fileName?.split('.').pop()?.toLowerCase()
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

    // Format documents for frontend
    const formattedDocuments = documents.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      description: doc.description || 'No description provided',
      category: doc.category_name || 'Uncategorized',
      type: getFileType(doc.content_type, doc.name),
      size: formatFileSize(doc.file_size || 0),
      status: doc.status,
      uploadedBy: doc.uploaded_by_name || 'Unknown User',
      lastUpdated: doc.updated_at
        ? dayjs.utc(doc.updated_at).tz(userTimezone).format('DD/MM/YYYY, hh:mm A')
        : 'Unknown',
      artefact: doc.name,
      publicUrl: doc.document_link,
      summarized: doc.summarized ? 'Yes' : 'No',
      summary: doc.summary,
      contentType: doc.content_type,
      fileSize: doc.file_size,
      updatedAt: doc.updated_at,
    }))

    // Prepare stats object
    const stats = {
      totalArtefacts,
      processedArtefacts,
      totalCategories,
      totalSize: formatFileSize(totalSizeBytes)
    }

    setResponseStatus(event, 200)

    return {
      statusCode: 200,
      status: 'success',
      data: {
        artefacts: formattedDocuments,
        stats: stats
      },
      message: formattedDocuments.length > 0 ? 'Artefacts fetched successfully' : 'No artefacts found',
    }
  } catch (err: any) {
    throw new CustomError(err.message || 'Failed to fetch artefacts', 500)
  }
})
