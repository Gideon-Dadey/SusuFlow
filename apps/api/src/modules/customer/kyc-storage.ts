import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BadRequestException } from "@nestjs/common";

const MAX_BYTES = 2_500_000;
const DATA_URL_RE =
  /^data:(image\/(?:jpeg|jpg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=\s]+)$/i;

export function kycUploadsDir() {
  return join(process.cwd(), "uploads", "kyc");
}

export function publicKycFileUrl(filename: string) {
  const base = (process.env.API_URL || "http://localhost:4000").replace(
    /\/$/,
    "",
  );
  return `${base}/uploads/kyc/${filename}`;
}

function extensionForMime(mime: string) {
  const normalized = mime.toLowerCase();
  if (normalized.includes("png")) return "png";
  if (normalized.includes("webp")) return "webp";
  if (normalized.includes("pdf")) return "pdf";
  return "jpg";
}

/** Turn a data URL into a stored file path. Pass through http(s) and existing upload URLs. */
export async function persistKycUpload(fileUrl: string): Promise<string> {
  const trimmed = fileUrl.trim();
  if (!trimmed) {
    throw new BadRequestException("Each document must include a photo.");
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/uploads/kyc/")) {
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

  const filename = `${randomUUID()}.${extensionForMime(match[1])}`;
  const dir = kycUploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);
  return publicKycFileUrl(filename);
}
