import "server-only";
import { v2 as cloudinary } from "cloudinary";

export function isUploadConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
  maxFileSize: number;
}

/**
 * Produces a signed-upload payload for the client to POST directly to
 * Cloudinary — the file itself never passes through our server. Every
 * constraint here (folder, allowed formats, size cap) is baked into the
 * signature, so a client can't loosen them: Cloudinary rejects the upload
 * server-side if the actual file doesn't match what was signed.
 */
export function createSignedUpload(folder: "students" | "teachers"): SignedUploadParams {
  if (!isUploadConfigured()) {
    throw new Error("Cloudinary is not configured (CLOUDINARY_* env vars missing)");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const timestamp = Math.round(Date.now() / 1000);
  const scopedFolder = `jnv-smart-connect/${folder}`;

  const paramsToSign = {
    timestamp,
    folder: scopedFolder,
    allowed_formats: ALLOWED_FORMATS.join(","),
    max_file_size: MAX_UPLOAD_BYTES,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder: scopedFolder,
    allowedFormats: ALLOWED_FORMATS.join(","),
    maxFileSize: MAX_UPLOAD_BYTES,
  };
}

export { MAX_UPLOAD_BYTES, ALLOWED_FORMATS };
