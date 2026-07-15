import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { QrCheckinClient } from "@/components/attendance/qr-checkin-client";

export default async function QrCheckinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await requirePermission(PERMISSIONS.ATTENDANCE_VIEW);
  const { token } = await params;

  return <QrCheckinClient token={token} />;
}
