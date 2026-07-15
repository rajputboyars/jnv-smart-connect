import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { StudentProfile } from "@/components/students/student-profile";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.STUDENTS_VIEW);
  const { id } = await params;

  return <StudentProfile id={id} />;
}
