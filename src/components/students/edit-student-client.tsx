"use client";

import { useStudent } from "@/hooks/use-students";
import { StudentForm } from "@/components/students/student-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateStudentInput } from "@/validators/student.validator";

export function EditStudentClient({ id }: { id: string }) {
  const { data: student, isLoading } = useStudent(id);

  if (isLoading || !student) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  const defaultValues: Partial<CreateStudentInput> = {
    admissionNumber: student.admissionNumber,
    rollNumber: student.rollNumber ?? "",
    aadhaarNumber: student.aadhaarNumber ?? "",
    name: student.name,
    photoUrl: student.photoUrl ?? "",
    dob: student.dob ? student.dob.slice(0, 10) : "",
    gender: student.gender as CreateStudentInput["gender"],
    bloodGroup: student.bloodGroup as CreateStudentInput["bloodGroup"],
    address: student.address as CreateStudentInput["address"],
    guardianDetails: student.guardianDetails as CreateStudentInput["guardianDetails"],
    emergencyContact: student.emergencyContact,
    previousSchool: student.previousSchool ?? "",
    currentClass: student.currentClass?._id ?? "",
    section: student.section?._id ?? "",
    house: student.house as CreateStudentInput["house"],
    isHosteller: student.isHosteller,
    medicalInfo: student.medicalInfo as CreateStudentInput["medicalInfo"],
    status: student.status as CreateStudentInput["status"],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Edit {student.name}</h1>
        <p className="text-sm text-muted-foreground">Update the student&apos;s record.</p>
      </div>
      <StudentForm studentId={id} defaultValues={defaultValues} />
    </div>
  );
}
