import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateAssetSchema } from "@/validators/inventory.validator";
import { getAssetById, updateAsset, deleteAsset } from "@/controllers/asset.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Ctx>(
  withAnyPermission<Ctx>([PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE], async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const data = await getAssetById(id, session.school);
    return ok(data);
  })
);

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.INVENTORY_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateAssetSchema.parse(body);
    const asset = await updateAsset(id, input, { id: session.sub, school: session.school });
    return ok({ id: asset._id.toString() }, { message: "Asset updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.INVENTORY_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    await deleteAsset(id, { id: session.sub, school: session.school });
    return ok(null, { message: "Asset removed" });
  })
);
