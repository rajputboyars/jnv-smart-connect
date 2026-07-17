import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { ApiError } from "@/lib/utils/api-error";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createEmployeeDocumentSchema } from "@/validators/hr.validator";
import { listEmployeeDocuments, createEmployeeDocument } from "@/controllers/employee-record.controller";
import { ok } from "@/lib/utils/api-response";

const HR_PERMISSIONS = [PERMISSIONS.HR_VIEW, PERMISSIONS.HR_MANAGE];

export const GET = withErrorHandling(
  withAnyPermission(HR_PERMISSIONS, async (req, _ctx, session) => {
    const teacher = req.nextUrl.searchParams.get("teacher");
    if (!teacher) throw ApiError.badRequest("teacher is required");
    const documents = await listEmployeeDocuments(teacher, session);
    return ok(documents);
  })
);

export const POST = withErrorHandling(
  withAnyPermission(HR_PERMISSIONS, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createEmployeeDocumentSchema.parse(body);
    const document = await createEmployeeDocument(input, session);
    return ok({ id: document._id.toString() }, { status: 201, message: "Document uploaded" });
  })
);
