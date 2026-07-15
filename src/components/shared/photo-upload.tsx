"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestUploadSignature, uploadToCloudinary } from "@/services/upload.service";
import { ApiClientError } from "@/lib/api-client";
import { initials } from "@/lib/utils";

const MAX_CLIENT_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PhotoUpload({
  value,
  onChange,
  folder,
  name,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: "students" | "teachers";
  name: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP images are allowed");
      return;
    }
    if (file.size > MAX_CLIENT_BYTES) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const params = await requestUploadSignature(folder);
      const url = await uploadToCloudinary(file, params);
      onChange(url);
      toast.success("Photo uploaded");
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 400) {
        toast.error("Photo uploads aren't configured for this deployment — paste an image URL instead");
      } else {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-14">
        {value ? <AvatarImage src={value} alt={name} /> : null}
        <AvatarFallback>{initials(name || "?")}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1.5">
        <div className="flex gap-2">
          <Input
            placeholder="https://… or upload a photo"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" />
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
}
