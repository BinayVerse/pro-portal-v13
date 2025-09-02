import { defineEventHandler, setResponseStatus } from 'h3';
import { CustomError } from '../../../utils/custom.error';
import jwt from 'jsonwebtoken';
import path from 'path';
import {
    S3Client,
    GetObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const bucketName = config.awsBucketName;
    const folderName = config.awsFolderName;

    const fileName = `provento${folderName === 'prod' ? '' : '-test'}.zip`;
    const fileKey = `${folderName}/misc-documents/${fileName}`;

    const token = event.node.req.headers['authorization']?.split(' ')[1];
    if (!token) {
        setResponseStatus(event, 401);
        throw new CustomError('Unauthorized: No token provided', 401);
    }

    try {
        jwt.verify(token, config.jwtToken as string);
    } catch {
        setResponseStatus(event, 401);
        throw new CustomError('Unauthorized: Invalid token', 401);
    }

    const s3 = new S3Client({
        region: config.awsRegion,
        credentials: {
            accessKeyId: config.awsAccessKeyId,
            secretAccessKey: config.awsSecretAccessKey,
        },
    });

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
        });

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

        const fileType = path.extname(fileKey).substring(1).toLowerCase();
        const fileName = path.basename(fileKey);

        setResponseStatus(event, 200);
        return {
            statusCode: 200,
            status: 'success',
            fileUrl: signedUrl,
            fileType,
            fileName,
        };
    } catch (error: any) {
        console.error('Error accessing S3 file:', {
            message: error.message,
            name: error.name,
            code: error?.$metadata?.httpStatusCode,
            bucketName,
            fileKey,
        });

        if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') {
            setResponseStatus(event, 404);
            throw new CustomError('Teams app package not found', 404);
        }

        setResponseStatus(event, 500);
        throw new CustomError(error.message || 'Error generating download URL', 500);
    }
});
