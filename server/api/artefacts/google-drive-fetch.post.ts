import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { google } from 'googleapis'
import { CustomError } from '../../utils/custom.error'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { folderUrl } = body

        if (!folderUrl) {
            throw new CustomError('Google Drive folder URL is required', 400)
        }

        let folderId: string

        if (folderUrl === 'https://drive.google.com/drive/my-drive') {
            folderId = 'root'
        } else {
            const match = folderUrl.match(/[-\w]{25,}/)
            if (!match) {
                throw new CustomError('Invalid Google Drive folder URL', 400)
            }
            folderId = match[0]
        }

        const config = useRuntimeConfig()
        const base64Creds = config.googleApplicationCredentialsBase64 as string

        if (!base64Creds) {
            throw new CustomError('Missing GCP credentials', 500)
        }

        const jsonString = Buffer.from(base64Creds, 'base64').toString('utf-8')
        const credentials = JSON.parse(jsonString)

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        })

        const drive = google.drive({ version: 'v3', auth })

        // Validate folder
        try {
            const folderResponse = await drive.files.get({
                fileId: folderId,
                fields: 'id',
            })

            if (!folderResponse.data.id) {
                throw new CustomError('Invalid Google Drive folder: Folder not found', 400)
            }
        } catch {
            throw new CustomError('Invalid Google Drive folder: Folder not found', 400)
        }

        const allowedExtensions = ['.csv', '.doc', '.docx', '.pdf', '.md', '.txt']

        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
            fields: 'files(id, name, mimeType, size, webViewLink, thumbnailLink, modifiedTime)',
        })

        const allFiles = response.data.files ?? []

        const filteredFiles = allFiles
            .filter(file => {
                const ext = file.name?.toLowerCase().split('.').pop()
                return ext && allowedExtensions.includes(`.${ext}`)
            })
            .map(file => ({
                ...file,
                size: file.size ? (Number(file.size) / 1024).toFixed(2) + ' KB' : 'Unknown',
                type: getFileType(file.name || '', file.mimeType || ''),
            }))

        setResponseStatus(event, 201)
        return {
            statusCode: 201,
            status: 'success',
            data: filteredFiles,
            message: filteredFiles.length ? 'Files fetched successfully' : 'No files found',
            otherFiles: allFiles.length - filteredFiles.length,
        }
    } catch (err: any) {
        throw new CustomError(err.message || 'Failed to fetch files', 500)
    }
})

function getFileType(fileName: string, mimeType: string): string {
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

  if (extension && typeMap[extension]) {
    return typeMap[extension]
  }

  // Fallback to mime type mapping
  const mimeTypeMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'text/plain': 'TXT',
    'text/csv': 'CSV',
    'text/markdown': 'Markdown',
    'image/png': 'Image',
    'image/jpeg': 'Image',
  }

  return mimeTypeMap[mimeType] || 'Unknown'
}
