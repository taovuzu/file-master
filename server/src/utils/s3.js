import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable, PassThrough } from "stream";
import fs from "fs/promises";
import path from "path";

const s3Region = process.env.AWS_REGION;
const s3Bucket = process.env.S3_BUCKET_NAME;

export const s3Client = new S3Client({
  region: s3Region,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

export async function createPresignedPutUrl(key, contentType, expiresInSeconds = 300) {
  const command = new PutObjectCommand({ Bucket: s3Bucket, Key: key, ContentType: contentType });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export async function createPresignedGetUrl(key, expiresInSeconds = 60) {
  const command = new GetObjectCommand({ Bucket: s3Bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export async function downloadFromS3ToFile(key, filePath) {
  const command = new GetObjectCommand({ Bucket: s3Bucket, Key: key });
  const resp = await s3Client.send(command);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const writeStream = (await import("fs")).createWriteStream(filePath);
  return new Promise((resolve, reject) => {
    resp.Body.pipe(writeStream);
    resp.Body.on("error", reject);
    writeStream.on("error", reject);
    writeStream.on("close", resolve);
  });
}

export async function uploadFileToS3(filePath, key, contentType = "application/pdf") {
  const data = await fs.readFile(filePath);
  const command = new PutObjectCommand({ Bucket: s3Bucket, Key: key, Body: data, ContentType: contentType });
  await s3Client.send(command);
}

export async function getS3ObjectMetadata(key) {
  const command = new GetObjectCommand({ Bucket: s3Bucket, Key: key });
  const response = await s3Client.send(command);
  return {
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    lastModified: response.LastModified
  };
}

/**
 * Creates a readable stream from S3 object for secure streaming processing
 * @param {string} key - S3 object key
 * @returns {Promise<Readable>} - Readable stream from S3
 */
export async function createS3DownloadStream(key) {
  const command = new GetObjectCommand({ Bucket: s3Bucket, Key: key });
  const response = await s3Client.send(command);
  
  // Convert AWS SDK stream to Node.js Readable stream
  if (response.Body instanceof Readable) {
    return response.Body;
  }
  
  // Handle different AWS SDK stream types
  const passThrough = new PassThrough();
  if (response.Body && typeof response.Body.transformToByteArray === 'function') {
    // Handle Uint8Array streams
    response.Body.transformToByteArray().then(bytes => {
      passThrough.write(Buffer.from(bytes));
      passThrough.end();
    }).catch(err => passThrough.destroy(err));
  } else if (response.Body && typeof response.Body.transformToString === 'function') {
    // Handle string streams
    response.Body.transformToString().then(str => {
      passThrough.write(str);
      passThrough.end();
    }).catch(err => passThrough.destroy(err));
  } else {
    // Fallback for other stream types
    passThrough.end();
  }
  
  return passThrough;
}

/**
 * Processes a stream and uploads the result to S3
 * @param {Readable} inputStream - Input stream to process
 * @param {string} key - S3 object key
 * @param {string} contentType - MIME type of the content
 * @returns {Promise} - Upload completion promise
 */
export async function streamToS3(inputStream, key, contentType = 'application/pdf') {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    inputStream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    inputStream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const command = new PutObjectCommand({
          Bucket: s3Bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ContentLength: buffer.length
        });
        
        const result = await s3Client.send(command);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    
    inputStream.on('error', reject);
  });
}

/**
 * Streams data from S3 through a processing function to S3
 * @param {string} inputKey - Source S3 key
 * @param {string} outputKey - Destination S3 key
 * @param {Function} processor - Function that takes input stream and returns output stream
 * @param {string} contentType - Output content type
 * @returns {Promise} - Upload completion promise
 */
export async function streamProcessS3ToS3(inputKey, outputKey, processor, contentType = 'application/pdf') {
  const inputStream = await createS3DownloadStream(inputKey);
  
  // Process the stream
  const outputStream = await processor(inputStream);
  
  // Upload the processed stream to S3
  return await streamToS3(outputStream, outputKey, contentType);
}

export { s3Bucket };
