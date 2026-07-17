import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { getEmployeeFile } from "@/controllers/employee-record.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ teacherId: string }> };

export const GET = withErrorHandling<Ctx>(
  withAnyPermission<Ctx>([PERMISSIONS.HR_VIEW, PERMISSIONS.HR_MANAGE], async (_req, ctx, session) => {
    const { teacherId } = await ctx.params;
    const file = await getEmployeeFile(teacherId, session);
    return ok(file);
  })
);
