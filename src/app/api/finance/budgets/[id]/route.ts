import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateBudgetSchema } from "@/validators/finance.validator";
import { updateBudget } from "@/controllers/finance-ledger.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateBudgetSchema.parse(body);
    const budget = await updateBudget(id, input, { id: session.sub, school: session.school });
    return ok({ id: budget._id.toString() }, { message: "Budget updated" });
  })
);
