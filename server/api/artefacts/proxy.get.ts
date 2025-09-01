import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import axios from 'axios'

export default defineEventHandler(async (event) => {
    // Use getQuery to extract query parameters
    const query = getQuery(event)
    const fileUrl = query.fileUrl as string

    if (!fileUrl) {
        setResponseStatus(event, 400)
        return { error: 'No file URL provided.' }
    }

    try {

        const response = await axios.get(fileUrl, {
            responseType: 'arraybuffer',
            timeout: 30000, // 30 seconds timeout
            headers: {
                'User-Agent': 'Provento-App/1.0'
            }
        })


        return {
            data: response.data.toString('base64'),
            contentType: response.headers['content-type'],
        }
    } catch (error: any) {
        setResponseStatus(event, error.response?.status || 500)

        const errorMessage = error.response?.status === 403
            ? 'Access denied to file. The file URL may have expired.'
            : error.response?.status === 404
            ? 'File not found.'
            : `Failed to fetch file: ${error.message}`

        return {
            error: errorMessage,
            details: {
                status: error.response?.status,
                statusText: error.response?.statusText
            }
        }
    }
})
