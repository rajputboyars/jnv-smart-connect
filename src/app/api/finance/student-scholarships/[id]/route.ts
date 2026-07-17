import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { revokeScholarship } from "@/controllers/scholarship.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    await revokeScholarship(id, { id: session.sub, school: session.school });
    return ok(null, { message: "Scholarship assignment revoked" });
  })
);
