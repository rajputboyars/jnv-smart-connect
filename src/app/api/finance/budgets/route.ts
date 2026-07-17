import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createBudgetSchema } from "@/validators/finance.validator";
import { listBudgets, createBudget } from "@/controllers/finance-ledger.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const academicYear = req.nextUrl.searchParams.get("academicYear") ?? undefined;
    const budgets = await listBudgets(session.school, academicYear);
    return ok(budgets);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createBudgetSchema.parse(body);
    const budget = await createBudget(input, { id: session.sub, school: session.school });
    return ok({ id: budget._id.toString() }, { status: 201, message: "Budget created" });
  })
);
