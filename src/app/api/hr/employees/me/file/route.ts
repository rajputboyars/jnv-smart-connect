import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { findOwnTeacherId } from "@/lib/auth/teacher-scope";
import { getEmployeeFile } from "@/controllers/employee-record.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAnyPermission([PERMISSIONS.HR_VIEW, PERMISSIONS.HR_MANAGE], async (_req, _ctx, session) => {
    // Staff with self-service HR access but no employee record (e.g. a
    // librarian) simply have no file — return null instead of erroring.
    const teacherId = await findOwnTeacherId(session);
    if (!teacherId) return ok(null);
    const file = await getEmployeeFile(teacherId, session);
    return ok(file);
  })
);
