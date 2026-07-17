import { requireAnyPermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { EventsPanel } from "@/components/events/events-panel";

export default async function EventsPage() {
  await requireAnyPermission([PERMISSIONS.EVENTS_VIEW, PERMISSIONS.EVENTS_MANAGE]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Event Management</h1>
        <p className="text-sm text-muted-foreground">
          Sports, Annual Day, NCC, Scouts, competitions and exhibitions — participants, photo gallery, and certificates.
        </p>
      </div>
      <EventsPanel />
    </div>
  );
}
