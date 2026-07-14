import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { TeacherForm } from "@/components/teachers/teacher-form";

export default async function NewTeacherPage() {
  await requirePermission(PERMISSIONS.TEACHERS_CREATE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Add teacher</h1>
        <p className="text-sm text-muted-foreground">
          Create a new teacher profile. A login link will be emailed to them.
        </p>
      </div>
      <TeacherForm />
    </div>
  );
}
