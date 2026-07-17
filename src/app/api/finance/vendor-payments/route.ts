import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createVendorPaymentSchema } from "@/validators/finance.validator";
import { listVendorPayments, createVendorPayment } from "@/controllers/finance-ledger.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const vendorId = req.nextUrl.searchParams.get("vendorId") ?? undefined;
    const items = await listVendorPayments(session.school, vendorId);
    return ok(items);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createVendorPaymentSchema.parse(body);
    const payment = await createVendorPayment(input, { id: session.sub, school: session.school });
    return ok({ id: payment._id.toString() }, { status: 201, message: "Vendor payment recorded" });
  })
);
