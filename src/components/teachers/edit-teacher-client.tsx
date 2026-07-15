"use client";

import { useTeacher } from "@/hooks/use-teachers";
import { TeacherForm } from "@/components/teachers/teacher-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateTeacherInput } from "@/validators/teacher.validator";

export function EditTeacherClient({ id }: { id: string }) {
  const { data: teacher, isLoading } = useTeacher(id);

  if (isLoading || !teacher) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  const defaultValues: Partial<CreateTeacherInput> = {
    employeeId: teacher.employeeId,
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    photoUrl: teacher.photoUrl ?? "",
    qualification: teacher.qualification,
    designation: teacher.designation ?? "",
    subjects: teacher.subjects.map((s) => s._id),
    assignedClasses: teacher.assignedClasses.map((ac) => ({
      class: ac.class._id,
      section: ac.section._id,
      subject: ac.subject._id,
    })),
    experienceYears: teacher.experienceYears,
    joiningDate: teacher.joiningDate.slice(0, 10),
    status: teacher.status as CreateTeacherInput["status"],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Edit {teacher.name}</h1>
        <p className="text-sm text-muted-foreground">Update the teacher&apos;s record.</p>
      </div>
      <TeacherForm teacherId={id} defaultValues={defaultValues} />
    </div>
  );
}
