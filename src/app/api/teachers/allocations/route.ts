import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { listTeacherAllocations } from "@/controllers/teacher.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACADEMICS_MANAGE, async (_req, _ctx, session) => {
    const allocations = await listTeacherAllocations(session.school);
    return ok(allocations);
  })
);
