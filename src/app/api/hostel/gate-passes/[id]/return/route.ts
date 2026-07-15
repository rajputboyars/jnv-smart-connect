import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { markGatePassReturned } from "@/controllers/gate-pass.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.HOSTEL_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const pass = await markGatePassReturned(id, { id: session.sub, school: session.school });
    return ok({ id: pass._id.toString() }, { message: "Gate pass marked returned" });
  })
);
