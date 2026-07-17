import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { generateInvoicesForStructure } from "@/controllers/fee-invoice.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await generateInvoicesForStructure(id, { id: session.sub, school: session.school });
    return ok(result, {
      message: `Generated ${result.invoicesCreated} invoice(s) for ${result.studentsProcessed} student(s)`,
    });
  })
);
