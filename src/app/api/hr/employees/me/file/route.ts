import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { resolveOwnTeacherId } from "@/lib/auth/teacher-scope";
import { getEmployeeFile } from "@/controllers/employee-record.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAnyPermission([PERMISSIONS.HR_VIEW, PERMISSIONS.HR_MANAGE], async (_req, _ctx, session) => {
    const teacherId = await resolveOwnTeacherId(session);
    const file = await getEmployeeFile(teacherId, session);
    return ok(file);
  })
);
