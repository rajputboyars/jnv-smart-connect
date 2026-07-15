import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { checkOutVisitor } from "@/controllers/visitor-log.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.HOSTEL_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const log = await checkOutVisitor(id, { id: session.sub, school: session.school });
    return ok({ id: log._id.toString() }, { message: "Visitor checked out" });
  })
);
