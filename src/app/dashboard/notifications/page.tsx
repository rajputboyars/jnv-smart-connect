import { requirePermission, getSession } from "@/lib/auth/dal";
import { PERMISSIONS, can } from "@/lib/auth/rbac";
import { NotificationFeed } from "@/components/notifications/notification-feed";
import { NotificationComposer } from "@/components/notifications/notification-composer";

export default async function NotificationsPage() {
  await requirePermission(PERMISSIONS.NOTIFICATIONS_VIEW);
  const session = await getSession();
  const canSend = session ? can(session.role, PERMISSIONS.NOTIFICATIONS_SEND) : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Announcements and updates for your school.</p>
        </div>
        {canSend && <NotificationComposer />}
      </div>

      <NotificationFeed />
    </div>
  );
}
