import { describe, expect, it, beforeEach, afterEach } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("cloudinary upload signing", () => {
  beforeEach(() => {
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("reports configured only when all three env vars are present", async () => {
    const { isUploadConfigured } = await import("./cloudinary");
    expect(isUploadConfigured()) .toBe(true);

    delete process.env.CLOUDINARY_API_SECRET;
    expect(isUploadConfigured()).toBe(false);
  });

  it("produces a signature scoped to the requested folder", async () => {
    const { createSignedUpload } = await import("./cloudinary");
    const params = createSignedUpload("students");

    expect(params.folder).toBe("jnv-smart-connect/students");
    expect(params.cloudName).toBe("test-cloud");
    expect(params.apiKey).toBe("test-key");
    expect(params.signature).toMatch(/^[a-f0-9]{40}$/); // sha1 hex digest
    expect(params.maxFileSize).toBeGreaterThan(0);
  });

  it("throws instead of signing when Cloudinary isn't configured", async () => {
    delete process.env.CLOUDINARY_API_SECRET;
    const { createSignedUpload } = await import("./cloudinary");
    expect(() => createSignedUpload("teachers")).toThrow(/not configured/i);
  });

  it("produces a different signature per folder (can't be reused cross-folder)", async () => {
    const { createSignedUpload } = await import("./cloudinary");
    const students = createSignedUpload("students");
    const teachers = createSignedUpload("teachers");
    expect(students.signature).not.toBe(teachers.signature);
  });

  it("signs employee documents for Cloudinary's raw resource type with document formats", async () => {
    const { createSignedUpload } = await import("./cloudinary");
    const params = createSignedUpload("documents");

    expect(params.resourceType).toBe("raw");
    expect(params.allowedFormats).toContain("pdf");
    expect(params.folder).toBe("jnv-smart-connect/documents");
  });
});
