import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { invoiceQuerySchema } from "@/validators/finance.validator";
import { listInvoices } from "@/controllers/fee-invoice.controller";
import { paginated } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAnyPermission([PERMISSIONS.ACCOUNTS_MANAGE, PERMISSIONS.FINANCE_VIEW], async (req, _ctx, session) => {
    const params = req.nextUrl.searchParams;
    const query = invoiceQuerySchema.parse({
      page: Number(params.get("page") ?? 1),
      limit: Number(params.get("limit") ?? 20),
      status: params.get("status") ?? undefined,
      classId: params.get("classId") ?? undefined,
      studentId: params.get("studentId") ?? undefined,
      search: params.get("search") ?? undefined,
    });

    const { items, total } = await listInvoices(query, session);
    return paginated(items, { page: query.page, limit: query.limit, total });
  })
);
