import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { TeacherTable } from "@/components/teachers/teacher-table";

export default async function TeachersPage() {
  await requirePermission(PERMISSIONS.TEACHERS_VIEW);
  return <TeacherTable />;
}
