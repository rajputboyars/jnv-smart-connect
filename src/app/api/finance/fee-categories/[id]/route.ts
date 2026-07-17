import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateFeeCategorySchema } from "@/validators/finance.validator";
import { updateFeeCategory, deleteFeeCategory } from "@/controllers/fee-structure.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateFeeCategorySchema.parse(body);
    const category = await updateFeeCategory(id, input, { id: session.sub, school: session.school });
    return ok({ id: category._id.toString() }, { message: "Fee category updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    await deleteFeeCategory(id, { id: session.sub, school: session.school });
    return ok(null, { message: "Fee category removed" });
  })
);
