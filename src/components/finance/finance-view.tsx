"use client";

import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MyFeesPanel } from "@/components/finance/my-fees-panel";
import { FeeSetupPanel } from "@/components/finance/fee-setup-panel";
import { InvoiceListPanel } from "@/components/finance/invoice-list-panel";
import { ScholarshipPanel } from "@/components/finance/scholarship-panel";
import { IncomeDonationPanel } from "@/components/finance/income-donation-panel";
import { ExpenseVendorPanel } from "@/components/finance/expense-vendor-panel";
import { BudgetPanel } from "@/components/finance/budget-panel";
import { RefundsPanel } from "@/components/finance/refunds-panel";
import { ReportsPanel } from "@/components/finance/reports-panel";

export function FinanceView() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <Skeleton className="h-96 w-full rounded-xl" />;

  const canManage = can(user.role, PERMISSIONS.ACCOUNTS_MANAGE);

  if (!canManage) {
    return <MyFeesPanel />;
  }

  return (
    <Tabs defaultValue="invoices">
      <TabsList className="flex-wrap">
        <TabsTrigger value="invoices">Invoices &amp; Payments</TabsTrigger>
        <TabsTrigger value="fee-setup">Fee Setup</TabsTrigger>
        <TabsTrigger value="scholarships">Scholarships &amp; Waivers</TabsTrigger>
        <TabsTrigger value="refunds">Refunds</TabsTrigger>
        <TabsTrigger value="income">Income &amp; Donations</TabsTrigger>
        <TabsTrigger value="expenses">Expenses &amp; Vendors</TabsTrigger>
        <TabsTrigger value="budget">Budget</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="invoices">
        <InvoiceListPanel />
      </TabsContent>
      <TabsContent value="fee-setup">
        <FeeSetupPanel />
      </TabsContent>
      <TabsContent value="scholarships">
        <ScholarshipPanel />
      </TabsContent>
      <TabsContent value="refunds">
        <RefundsPanel />
      </TabsContent>
      <TabsContent value="income">
        <IncomeDonationPanel />
      </TabsContent>
      <TabsContent value="expenses">
        <ExpenseVendorPanel />
      </TabsContent>
      <TabsContent value="budget">
        <BudgetPanel />
      </TabsContent>
      <TabsContent value="reports">
        <ReportsPanel />
      </TabsContent>
    </Tabs>
  );
}
