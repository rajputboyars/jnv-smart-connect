import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { vacateBed } from "@/controllers/hostel.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.HOSTEL_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await vacateBed(id, { id: session.sub, school: session.school });
    return ok(result, { message: "Bed vacated" });
  })
);
