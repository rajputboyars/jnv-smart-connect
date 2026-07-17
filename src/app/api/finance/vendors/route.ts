import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createVendorSchema } from "@/validators/finance.validator";
import { listVendors, createVendor } from "@/controllers/finance-ledger.controller";
import { ok } from "@/lib/utils/api-response";

// Vendors are shared between Finance (expenses/vendor payments) and
// Inventory (purchase orders) — either module's manage permission is enough.
const VENDOR_PERMISSIONS = [PERMISSIONS.ACCOUNTS_MANAGE, PERMISSIONS.INVENTORY_MANAGE];

export const GET = withErrorHandling(
  withAnyPermission(VENDOR_PERMISSIONS, async (_req, _ctx, session) => {
    const vendors = await listVendors(session.school);
    return ok(vendors);
  })
);

export const POST = withErrorHandling(
  withAnyPermission(VENDOR_PERMISSIONS, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createVendorSchema.parse(body);
    const vendor = await createVendor(input, { id: session.sub, school: session.school });
    return ok({ id: vendor._id.toString() }, { status: 201, message: "Vendor added" });
  })
);
