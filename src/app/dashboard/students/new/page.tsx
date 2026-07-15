import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { StudentForm } from "@/components/students/student-form";

export default async function NewStudentPage() {
  await requirePermission(PERMISSIONS.STUDENTS_CREATE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Add student</h1>
        <p className="text-sm text-muted-foreground">Create a new student admission record.</p>
      </div>
      <StudentForm />
    </div>
  );
}
