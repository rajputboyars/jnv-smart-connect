import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateFeeStructureSchema } from "@/validators/finance.validator";
import { updateFeeStructure, deleteFeeStructure } from "@/controllers/fee-structure.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateFeeStructureSchema.parse(body);
    const structure = await updateFeeStructure(id, input, { id: session.sub, school: session.school });
    return ok({ id: structure._id.toString() }, { message: "Fee structure updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    await deleteFeeStructure(id, { id: session.sub, school: session.school });
    return ok(null, { message: "Fee structure removed" });
  })
);
