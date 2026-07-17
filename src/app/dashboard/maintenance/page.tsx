import { requireAnyPermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { MaintenanceView } from "@/components/maintenance/maintenance-view";

export default async function MaintenancePage() {
  await requireAnyPermission([PERMISSIONS.MAINTENANCE_VIEW, PERMISSIONS.MAINTENANCE_MANAGE]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Maintenance</h1>
        <p className="text-sm text-muted-foreground">
          Raise and track complaint tickets, assign technicians, and resolve issues.
        </p>
      </div>
      <MaintenanceView />
    </div>
  );
}
