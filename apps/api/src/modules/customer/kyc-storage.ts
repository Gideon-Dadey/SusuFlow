import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BadRequestException, Logger } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const MAX_BYTES = 2_500_000;
const DATA_URL_RE =
  /^data:(image\/(?:jpeg|jpg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=\s]+)$/i;

const logger = new Logger("KycStorage");

export function kycUploadsDir() {
  return join(process.cwd(), "uploads", "kyc");
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function s3Configured(): boolean {
  return Boolean(
    process.env.AWS_S3_BUCKET?.trim() &&
    process.env.AWS_ACCESS_KEY_ID?.trim() &&
    process.env.AWS_SECRET_ACCESS_KEY?.trim(),
  );
}

function allowLocalKycStorage(): boolean {
  if (process.env.ALLOW_LOCAL_KYC_STORAGE === "true") return true;
  return !isProduction();
}

export function publicKycFileUrl(filename: string) {
  const base = (process.env.API_URL || "http://localhost:4000").replace(
    /\/$/,
    "",
  );
  return `${base}/uploads/kyc/${filename}`;
}

function publicS3Url(key: string) {
  const explicit = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (explicit) return `${explicit}/${key}`;

  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION || "eu-west-1";
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function extensionForMime(mime: string) {
  const normalized = mime.toLowerCase();
  if (normalized.includes("png")) return "png";
  if (normalized.includes("webp")) return "webp";
  if (normalized.includes("pdf")) return "pdf";
  return "jpg";
}

function contentTypeForExt(ext: string) {
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "pdf":
      return "application/pdf";
    default:
      return "image/jpeg";
  }
}

async function persistToS3(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION || "eu-west-1";
  const key = `kyc/${filename}`;

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
      // Private by default — staff fetch via signed URLs later if needed.
      ACL: undefined,
    }),
  );

  logger.log(`KYC object stored at s3://${bucket}/${key}`);
  return publicS3Url(key);
}

async function persistToLocalDisk(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  if (!allowLocalKycStorage()) {
    throw new BadRequestException(
      "KYC document storage is misconfigured. Set AWS_S3_BUCKET credentials for production.",
    );
  }

  const dir = kycUploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);
  logger.warn(`KYC stored on local disk (${filename}). Use S3 in production.`);
  return publicKycFileUrl(filename);
}

/** Turn a data URL into durable storage. Pass through http(s) and existing upload URLs. */
export async function persistKycUpload(fileUrl: string): Promise<string> {
  const trimmed = fileUrl.trim();
  if (!trimmed) {
    throw new BadRequestException("Each document must include a photo.");
  }

  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("/uploads/kyc/") ||
    trimmed.includes("/uploads/kyc/")
  ) {
    return trimmed;
  }

  const match = DATA_URL_RE.exec(trimmed);
  if (!match) {
    throw new BadRequestException(
      "Each document must be a JPEG, PNG, WebP, or PDF.",
    );
  }

  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length) {
    throw new BadRequestException("One of the photos could not be read.");
  }
  if (buffer.length > MAX_BYTES) {
    throw new BadRequestException(
      "One of the photos is too large. Use a clearer, closer shot.",
    );
  }

  const ext = extensionForMime(match[1]);
  const filename = `${randomUUID()}.${ext}`;
  const contentType = contentTypeForExt(ext);

  if (s3Configured()) {
    return persistToS3(buffer, filename, contentType);
  }

  if (isProduction()) {
    throw new BadRequestException(
      "Production KYC storage requires AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
    );
  }

  return persistToLocalDisk(buffer, filename);
}
