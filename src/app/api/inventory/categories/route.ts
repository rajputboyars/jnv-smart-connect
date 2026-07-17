import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createAssetCategorySchema } from "@/validators/inventory.validator";
import { listAssetCategories, createAssetCategory } from "@/controllers/asset.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAnyPermission([PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE], async (_req, _ctx, session) => {
    const categories = await listAssetCategories(session.school);
    return ok(categories);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.INVENTORY_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createAssetCategorySchema.parse(body);
    const category = await createAssetCategory(input, { id: session.sub, school: session.school });
    return ok({ id: category._id.toString() }, { status: 201, message: "Category created" });
  })
);
