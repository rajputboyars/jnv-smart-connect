import { Suspense } from "react";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { StudentTable } from "@/components/students/student-table";
import { Skeleton } from "@/components/ui/skeleton";

export default async function StudentsPage() {
  await requirePermission(PERMISSIONS.STUDENTS_VIEW);

  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <StudentTable />
    </Suspense>
  );
}
