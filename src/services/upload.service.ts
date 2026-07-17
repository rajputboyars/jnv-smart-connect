import { apiFetch } from "@/lib/api-client";

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

export async function requestUploadSignature(folder: "students" | "teachers" | "documents") {
  const res = await apiFetch<SignedUploadParams>("/api/uploads/sign", {
    method: "POST",
    body: JSON.stringify({ folder }),
  });
  return res.data as SignedUploadParams;
}

export async function uploadToCloudinary(file: File, params: SignedUploadParams): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", params.apiKey);
  formData.append("timestamp", String(params.timestamp));
  formData.append("signature", params.signature);
  formData.append("folder", params.folder);
  formData.append("allowed_formats", params.allowedFormats);
  formData.append("max_file_size", String(params.maxFileSize));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${params.cloudName}/${params.resourceType}/upload`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Upload failed");
  }

  return json.secure_url as string;
}
