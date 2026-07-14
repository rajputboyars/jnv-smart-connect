import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ComingSoon } from "@/components/shared/coming-soon";

export default async function AttendancePage() {
  await requirePermission(PERMISSIONS.ATTENDANCE_VIEW);
  return <ComingSoon title="Attendance" />;
}
