import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { TeacherProfile } from "@/components/teachers/teacher-profile";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.TEACHERS_VIEW);
  const { id } = await params;

  return <TeacherProfile id={id} />;
}
