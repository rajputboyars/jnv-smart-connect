import { requireAnyPermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { FinanceView } from "@/components/finance/finance-view";

export default async function AccountsPage() {
  await requireAnyPermission([PERMISSIONS.ACCOUNTS_MANAGE, PERMISSIONS.FINANCE_VIEW]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Accounts &amp; Finance</h1>
        <p className="text-sm text-muted-foreground">
          Fee management, scholarships, income &amp; expenses, budgeting, and financial reports.
        </p>
      </div>
      <FinanceView />
    </div>
  );
}
