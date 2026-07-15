import { withErrorHandling } from "@/middlewares/error-handler";
import { withAuth } from "@/middlewares/with-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { signUploadSchema } from "@/validators/upload.validator";
import { createSignedUpload, isUploadConfigured } from "@/lib/uploads/cloudinary";
import { ApiError } from "@/lib/utils/api-error";
import { ok } from "@/lib/utils/api-response";

// One endpoint, folder-scoped permission check: a photo upload for a
// student record requires the same permission that lets you edit that
// student, same for teachers — this endpoint doesn't grant any access a
// caller doesn't already have via the students/teachers CRUD permissions.
const FOLDER_PERMISSIONS = {
  students: [PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_UPDATE],
  teachers: [PERMISSIONS.TEACHERS_CREATE, PERMISSIONS.TEACHERS_UPDATE],
} as const;

export const POST = withErrorHandling(
  withAuth(async (req, _ctx, session) => {
    if (!isUploadConfigured()) {
      throw ApiError.badRequest("Photo uploads aren't configured for this deployment");
    }

    const body = await req.json();
    const { folder } = signUploadSchema.parse(body);

    const allowed = FOLDER_PERMISSIONS[folder].some((permission) => can(session.role, permission));
    if (!allowed) {
      throw ApiError.forbidden("You don't have permission to upload a photo here");
    }

    const params = createSignedUpload(folder);
    return ok(params);
  })
);
