import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateVendorSchema } from "@/validators/finance.validator";
import { updateVendor } from "@/controllers/finance-ledger.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };
const VENDOR_PERMISSIONS = [PERMISSIONS.ACCOUNTS_MANAGE, PERMISSIONS.INVENTORY_MANAGE];

export const PATCH = withErrorHandling<Ctx>(
  withAnyPermission<Ctx>(VENDOR_PERMISSIONS, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateVendorSchema.parse(body);
    const vendor = await updateVendor(id, input, { id: session.sub, school: session.school });
    return ok({ id: vendor._id.toString() }, { message: "Vendor updated" });
  })
);
