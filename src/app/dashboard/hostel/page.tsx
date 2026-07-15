import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { HostelView } from "@/components/hostel/hostel-view";

export default async function HostelPage() {
  await requirePermission(PERMISSIONS.HOSTEL_VIEW);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Hostel</h1>
        <p className="text-sm text-muted-foreground">
          Rooms, allocations, night attendance, leave and gate passes.
        </p>
      </div>
      <HostelView />
    </div>
  );
}
