import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createExpenseSchema } from "@/validators/finance.validator";
import { listExpenses, createExpense } from "@/controllers/finance-ledger.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const from = req.nextUrl.searchParams.get("from") ?? undefined;
    const to = req.nextUrl.searchParams.get("to") ?? undefined;
    const items = await listExpenses(session.school, from, to);
    return ok(items);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createExpenseSchema.parse(body);
    const expense = await createExpense(input, { id: session.sub, school: session.school });
    return ok({ id: expense._id.toString() }, { status: 201, message: "Expense recorded" });
  })
);
