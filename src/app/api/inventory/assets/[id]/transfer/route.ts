import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createAssetTransferSchema } from "@/validators/inventory.validator";
import { transferAsset } from "@/controllers/asset.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.INVENTORY_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = createAssetTransferSchema.parse({ ...body, asset: id });
    const transfer = await transferAsset(input, { id: session.sub, school: session.school });
    return ok({ id: transfer._id.toString() }, { status: 201, message: "Asset transferred" });
  })
);
