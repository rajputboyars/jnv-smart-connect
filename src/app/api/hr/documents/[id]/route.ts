import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { deleteEmployeeDocument } from "@/controllers/employee-record.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.HR_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    await deleteEmployeeDocument(id, { id: session.sub, school: session.school });
    return ok(null, { message: "Document removed" });
  })
);
