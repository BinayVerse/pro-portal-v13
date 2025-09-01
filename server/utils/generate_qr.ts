import QRCode from 'qrcode';
import { CustomError } from './custom.error';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const generateQRCode = async (companyName: string, wpNumber: string): Promise<string> => {
  const config = useRuntimeConfig();
  const folderName = config.awsFolderName;

  const s3Client = new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  });

  const bucketName = config.awsBucketName as string;
  if (!bucketName) {
    throw new CustomError('S3 bucket name not configured', 500);
  }

  const message = 'hi';
  const randomString = Math.random().toString(36).substring(2, 6);
  const customCompanyName = companyName.toLowerCase().replace(/ /g, '_');
  const qrFileName = `${customCompanyName}_wp_qr_code_${randomString}.png`;

  const companyFolder = `${customCompanyName}/`;
  const filePath = `${folderName}/${companyFolder}files/${qrFileName}`;

  try {
    const qrData = `https://wa.me/${wpNumber}?text=${encodeURIComponent(message)}`;
    const qrBuffer = await QRCode.toBuffer(qrData, {
      color: { dark: '#000000', light: '#ffffff' },
      width: 300,
    });

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: qrBuffer,
      ContentType: 'image/png',
      // ACL: 'public-read',
    }));

    const fileUrl = `https://${bucketName}.s3.${config.awsRegion}.amazonaws.com/${filePath}`;

    return fileUrl;

  } catch (error) {
    console.error('Error generating or uploading QR code:', error);
    throw new CustomError('QR code generation or upload failed', 500);
  }
};
