import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { assetQuerySchema, createAssetSchema } from "@/validators/inventory.validator";
import { listAssets, createAsset } from "@/controllers/asset.controller";
import { paginated, ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAnyPermission([PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE], async (req, _ctx, session) => {
    const params = req.nextUrl.searchParams;
    const query = assetQuerySchema.parse({
      page: Number(params.get("page") ?? 1),
      limit: Number(params.get("limit") ?? 20),
      category: params.get("category") ?? undefined,
      status: params.get("status") ?? undefined,
      search: params.get("search") ?? undefined,
    });
    const { items, total } = await listAssets(query, session.school);
    return paginated(items, { page: query.page, limit: query.limit, total });
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.INVENTORY_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createAssetSchema.parse(body);
    const asset = await createAsset(input, { id: session.sub, school: session.school });
    return ok({ id: asset._id.toString() }, { status: 201, message: "Asset added" });
  })
);
