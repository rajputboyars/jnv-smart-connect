import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AnalyticsPage() {
  await requirePermission(PERMISSIONS.ANALYTICS_VIEW);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Attendance, hostel, library, and health trends across the school.
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
