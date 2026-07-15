import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { EditStudentClient } from "@/components/students/edit-student-client";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.STUDENTS_UPDATE);
  const { id } = await params;

  return <EditStudentClient id={id} />;
}
