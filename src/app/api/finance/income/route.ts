import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createIncomeSchema } from "@/validators/finance.validator";
import { listIncome, createIncome } from "@/controllers/finance-ledger.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const from = req.nextUrl.searchParams.get("from") ?? undefined;
    const to = req.nextUrl.searchParams.get("to") ?? undefined;
    const items = await listIncome(session.school, from, to);
    return ok(items);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createIncomeSchema.parse(body);
    const income = await createIncome(input, { id: session.sub, school: session.school });
    return ok({ id: income._id.toString() }, { status: 201, message: "Income recorded" });
  })
);
