import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { getReceiptData } from "@/controllers/fee-invoice.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Ctx>(
  withAnyPermission<Ctx>([PERMISSIONS.ACCOUNTS_MANAGE, PERMISSIONS.FINANCE_VIEW], async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const data = await getReceiptData(id, session);
    return ok(data);
  })
);
