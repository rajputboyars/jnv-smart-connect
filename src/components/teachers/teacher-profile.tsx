"use client";

import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { useTeacher } from "@/hooks/use-teachers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { initials, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";

export function TeacherProfile({ id }: { id: string }) {
  const { data: teacher, isLoading } = useTeacher(id);
  const { user } = useAuth();
  const canEdit = user && can(user.role, PERMISSIONS.TEACHERS_UPDATE);

  if (isLoading || !teacher) {
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
          <Link href="/dashboard/teachers">
            <ArrowLeft className="size-4" /> Back to teachers
          </Link>
        </Button>
        {canEdit && (
          <Button asChild>
            <Link href={`/dashboard/teachers/${id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-6">
          <Avatar className="size-16">
            {teacher.photoUrl ? <AvatarImage src={teacher.photoUrl} alt={teacher.name} /> : null}
            <AvatarFallback className="text-lg">{initials(teacher.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">{teacher.name}</h1>
            <p className="text-sm text-muted-foreground">
              {teacher.employeeId} &middot; {teacher.email}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            {teacher.designation && <Badge>{teacher.designation}</Badge>}
            <Badge variant="outline">{teacher.status.replace("_", " ")}</Badge>
            <Badge variant="secondary">{teacher.experienceYears} yrs experience</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
              <p className="font-medium">{teacher.phone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Qualification</p>
              <p className="font-medium">{teacher.qualification}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Joining date</p>
              <p className="font-medium">{formatDate(teacher.joiningDate)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {teacher.subjects.length === 0 && (
              <p className="text-sm text-muted-foreground">No subjects assigned.</p>
            )}
            {teacher.subjects.map((s) => (
              <Badge key={s._id} variant="secondary">
                {s.name}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Assigned classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teacher.assignedClasses.length === 0 && (
              <p className="text-sm text-muted-foreground">No classes assigned yet.</p>
            )}
            {teacher.assignedClasses.map((ac, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border/60 py-2 last:border-0"
              >
                <span className="text-sm font-medium">
                  Class {ac.class?.name} - {ac.section?.name}
                </span>
                <Badge variant="outline">{ac.subject?.name}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
