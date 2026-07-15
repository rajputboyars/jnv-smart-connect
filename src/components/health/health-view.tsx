"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { ROLES } from "@/types/roles";
import { StudentPicker, type PickedStudent } from "@/components/shared/student-picker";
import { MedicalReportCard } from "@/components/health/medical-report-card";
import { LogMedicineDialog } from "@/components/health/log-medicine-dialog";
import { LogDoctorVisitDialog } from "@/components/health/log-doctor-visit-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { ParentDashboard } from "@/services/dashboard.service";

export function HealthView() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <Skeleton className="h-96 w-full rounded-xl" />;

  if (user.role === ROLES.STUDENT) {
    return <MedicalReportCard />;
  }

  if (user.role === ROLES.PARENT) {
    return <ParentHealthView />;
  }

  return <StaffHealthView canManage={can(user.role, PERMISSIONS.HEALTH_MANAGE)} />;
}

function ParentHealthView() {
  const { data, isLoading } = useDashboard();
  const [studentId, setStudentId] = useState<string | null>(null);

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;

  const parentData = data as ParentDashboard | undefined;
  const children = parentData?.children ?? [];

  if (children.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No children linked to your account yet.
      </p>
    );
  }

  const activeId = studentId ?? children[0]._id;

  return (
    <div className="space-y-6">
      {children.length > 1 && (
        <div className="max-w-xs space-y-1.5">
          <Label>Child</Label>
          <Select value={activeId} onValueChange={setStudentId}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child._id} value={child._id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <MedicalReportCard studentId={activeId} />
    </div>
  );
}

function StaffHealthView({ canManage }: { canManage: boolean }) {
  const [student, setStudent] = useState<PickedStudent | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-sm flex-1 space-y-1.5">
          <Label>Student</Label>
          <StudentPicker value={student} onChange={setStudent} />
        </div>
        {canManage && student && (
          <div className="flex gap-2">
            <LogMedicineDialog
              studentId={student.id}
              trigger={
                <Button variant="outline" size="sm">
                  <Plus className="size-4" /> Medicine
                </Button>
              }
            />
            <LogDoctorVisitDialog
              studentId={student.id}
              trigger={
                <Button size="sm">
                  <Plus className="size-4" /> Doctor visit
                </Button>
              }
            />
          </div>
        )}
      </div>

      {!student ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Search for a student to view their medical record.
        </p>
      ) : (
        <MedicalReportCard studentId={student.id} />
      )}
    </div>
  );
}
