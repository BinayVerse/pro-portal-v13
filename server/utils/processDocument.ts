import { CustomError } from './custom.error';
import axios, { AxiosError } from 'axios';

export async function processDocument(
    bucketName: string,
    folderName: string,
    orgName: string,
    orgId: string,
    userId: string,
    documents: { id: string; name: string; type: string; link: string }[],
    authToken: string
): Promise<any> {
    const config = useRuntimeConfig();
    const botEndpoint = config.public.botEndpoint;

    const apiUrl = `${botEndpoint}process-document`;

    const payload = {
        bucketName,
        folderName,
        orgName,
        orgId,
        userId,
        documents,
    };

    // console.log('Process payload:', payload);

    try {
        const response = await axios.post(apiUrl, payload, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            // timeout: 10000,
        });

        if (response.status == 200) {
            return response.data;
        } else {
            throw new Error(`Unexpected response status: ${response.status}`);
        }
    } catch (error: any) {
        // If the error is an axios error
        if (error.response) {
            const errorMessage = error.response.data?.message || 'Failed to process document';
            console.error('Error processing document:', errorMessage);
            throw new CustomError(errorMessage, error.response.status);
        } else {
            // Network or other unexpected errors
            console.error('Error processing document:', error.message || error);
            throw new CustomError(error.message || 'An unexpected error occurred', 500);
        }
    }
}
