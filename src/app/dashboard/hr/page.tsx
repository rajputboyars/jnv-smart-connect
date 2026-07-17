import { requireAnyPermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { HrView } from "@/components/hr/hr-view";

export default async function HrPage() {
  await requireAnyPermission([PERMISSIONS.HR_VIEW, PERMISSIONS.HR_MANAGE]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">HR Management</h1>
        <p className="text-sm text-muted-foreground">
          Staff leave, payroll, and the digital employee file.
        </p>
      </div>
      <HrView />
    </div>
  );
}
