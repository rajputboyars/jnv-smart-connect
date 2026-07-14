"use client";

import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { useStudent } from "@/hooks/use-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { initials, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

export function StudentProfile({ id }: { id: string }) {
  const { data: student, isLoading } = useStudent(id);
  const { user } = useAuth();
  const canEdit = user && can(user.role, PERMISSIONS.STUDENTS_UPDATE);

  if (isLoading || !student) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/students">
            <ArrowLeft className="size-4" /> Back to students
          </Link>
        </Button>
        {canEdit && (
          <Button asChild>
            <Link href={`/dashboard/students/${id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-6">
          <Avatar className="size-16">
            {student.photoUrl ? <AvatarImage src={student.photoUrl} alt={student.name} /> : null}
            <AvatarFallback className="text-lg">{initials(student.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">{student.name}</h1>
            <p className="text-sm text-muted-foreground">
              Admission No. {student.admissionNumber}
              {student.rollNumber ? ` · Roll No. ${student.rollNumber}` : ""}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Badge>
              Class {student.currentClass?.name} - {student.section?.name}
            </Badge>
            {student.house && <Badge variant="secondary">{student.house} House</Badge>}
            <Badge variant="outline">{student.status}</Badge>
            {student.isHosteller && <Badge variant="outline">Hosteller</Badge>}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Date of birth" value={student.dob ? formatDate(student.dob) : undefined} />
            <Field label="Gender" value={student.gender} />
            <Field label="Blood group" value={student.bloodGroup} />
            <Field label="Previous school" value={student.previousSchool} />
            <Field label="Admission date" value={student.admissionDate ? formatDate(student.admissionDate) : undefined} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guardian &amp; emergency contact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Father" value={student.guardianDetails?.fatherName} />
            <Field label="Father's phone" value={student.guardianDetails?.fatherPhone} />
            <Field label="Mother" value={student.guardianDetails?.motherName} />
            <Field label="Mother's phone" value={student.guardianDetails?.motherPhone} />
            <Field label="Emergency contact" value={student.emergencyContact?.name} />
            <Field label="Emergency phone" value={student.emergencyContact?.phone} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Line 1" value={student.address?.line1} />
            <Field label="Village/Town" value={student.address?.village} />
            <Field label="District" value={student.address?.district} />
            <Field label="State" value={student.address?.state} />
            <Field label="Pincode" value={student.address?.pincode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Conditions" value={student.medicalInfo?.conditions} />
            <Field label="Allergies" value={student.medicalInfo?.allergies} />
            <Field label="Medications" value={student.medicalInfo?.medications} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
