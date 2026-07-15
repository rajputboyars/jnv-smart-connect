import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { HealthView } from "@/components/health/health-view";

export default async function HealthPage() {
  await requirePermission(PERMISSIONS.HEALTH_VIEW);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Health</h1>
        <p className="text-sm text-muted-foreground">
          Medical history, medicine log and doctor visits.
        </p>
      </div>
      <HealthView />
    </div>
  );
}
