import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
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

export { s3Bucket };



