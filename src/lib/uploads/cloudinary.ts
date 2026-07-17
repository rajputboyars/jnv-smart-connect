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
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];
const ALLOWED_DOCUMENT_FORMATS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

export type UploadProfileKey = "students" | "teachers" | "documents";

interface UploadProfile {
  allowedFormats: string[];
  maxFileSize: number;
  resourceType: "image" | "raw";
}

const UPLOAD_PROFILES: Record<UploadProfileKey, UploadProfile> = {
  students: { allowedFormats: ALLOWED_FORMATS, maxFileSize: MAX_UPLOAD_BYTES, resourceType: "image" },
  teachers: { allowedFormats: ALLOWED_FORMATS, maxFileSize: MAX_UPLOAD_BYTES, resourceType: "image" },
  // Employee documents (resume, id proof, contracts, ...) aren't always
  // images, so they're signed for Cloudinary's "raw" resource type and a
  // wider format allow-list.
  documents: { allowedFormats: ALLOWED_DOCUMENT_FORMATS, maxFileSize: MAX_DOCUMENT_BYTES, resourceType: "raw" },
};

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
  maxFileSize: number;
  resourceType: "image" | "raw";
}

/**
 * Produces a signed-upload payload for the client to POST directly to
 * Cloudinary — the file itself never passes through our server. Every
 * constraint here (folder, allowed formats, size cap) is baked into the
 * signature, so a client can't loosen them: Cloudinary rejects the upload
 * server-side if the actual file doesn't match what was signed.
 */
export function createSignedUpload(profileKey: UploadProfileKey): SignedUploadParams {
  if (!isUploadConfigured()) {
    throw new Error("Cloudinary is not configured (CLOUDINARY_* env vars missing)");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const profile = UPLOAD_PROFILES[profileKey];
  const timestamp = Math.round(Date.now() / 1000);
  const scopedFolder = `jnv-smart-connect/${profileKey}`;

  const paramsToSign = {
    timestamp,
    folder: scopedFolder,
    allowed_formats: profile.allowedFormats.join(","),
    max_file_size: profile.maxFileSize,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder: scopedFolder,
    allowedFormats: profile.allowedFormats.join(","),
    maxFileSize: profile.maxFileSize,
    resourceType: profile.resourceType,
  };
}

export { MAX_UPLOAD_BYTES, ALLOWED_FORMATS };
