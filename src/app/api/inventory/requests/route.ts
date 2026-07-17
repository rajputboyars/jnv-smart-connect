import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createInventoryRequestSchema } from "@/validators/inventory.validator";
import { listInventoryRequests, createInventoryRequest } from "@/controllers/inventory-request.controller";
import { ok } from "@/lib/utils/api-response";

const REQUEST_PERMISSIONS = [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE];

export const GET = withErrorHandling(
  withAnyPermission(REQUEST_PERMISSIONS, async (req, _ctx, session) => {
    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const requests = await listInventoryRequests(session, status);
    return ok(requests);
  })
);

export const POST = withErrorHandling(
  withAnyPermission(REQUEST_PERMISSIONS, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createInventoryRequestSchema.parse(body);
    const request = await createInventoryRequest(input, { id: session.sub, school: session.school });
    return ok({ id: request._id.toString() }, { status: 201, message: "Request submitted" });
  })
);
