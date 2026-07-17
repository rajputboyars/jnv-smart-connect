"use client";

import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LeavePanel } from "@/components/hr/leave-panel";
import { PayrollPanel } from "@/components/hr/payroll-panel";
import { EmployeeFilePanel } from "@/components/hr/employee-file-panel";

export function HrView() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <Skeleton className="h-96 w-full rounded-xl" />;

  const canManage = can(user.role, PERMISSIONS.HR_MANAGE);

  return (
    <Tabs defaultValue="leave">
      <TabsList>
        <TabsTrigger value="leave">Leave</TabsTrigger>
        {canManage && <TabsTrigger value="payroll">Payroll</TabsTrigger>}
        <TabsTrigger value="employee-file">{canManage ? "Employee Files" : "My Employee File"}</TabsTrigger>
      </TabsList>
      <TabsContent value="leave">
        <LeavePanel />
      </TabsContent>
      {canManage && (
        <TabsContent value="payroll">
          <PayrollPanel />
        </TabsContent>
      )}
      <TabsContent value="employee-file">
        <EmployeeFilePanel />
      </TabsContent>
    </Tabs>
  );
}
