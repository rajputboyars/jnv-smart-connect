import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { EditTeacherClient } from "@/components/teachers/edit-teacher-client";

export default async function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.TEACHERS_UPDATE);
  const { id } = await params;

  return <EditTeacherClient id={id} />;
}
