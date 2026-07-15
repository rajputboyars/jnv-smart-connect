import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { AttendanceView } from "@/components/attendance/attendance-view";

export default async function AttendancePage() {
  await requirePermission(PERMISSIONS.ATTENDANCE_VIEW);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Mark daily attendance, review reports, and track your own record.
        </p>
      </div>
      <AttendanceView />
    </div>
  );
}
