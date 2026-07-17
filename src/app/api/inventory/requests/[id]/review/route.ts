import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { reviewInventoryRequestSchema } from "@/validators/inventory.validator";
import { reviewInventoryRequest } from "@/controllers/inventory-request.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.INVENTORY_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = reviewInventoryRequestSchema.parse(body);
    const request = await reviewInventoryRequest(id, input, { id: session.sub, school: session.school });
    return ok({ id: request._id.toString(), status: request.status }, { message: "Request updated" });
  })
);
