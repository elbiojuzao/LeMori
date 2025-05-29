import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

export async function uploadToS3(file: Express.Multer.File) {
  const key = `profiles/${Date.now()}-${file.originalname}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || '',
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  })

  await s3Client.send(command)
  
  return {
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`
  }
} 