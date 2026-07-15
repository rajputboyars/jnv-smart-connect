"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { ParentDashboard } from "@/services/dashboard.service";

export function ParentAttendanceView() {
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
    <div className="space-y-4">
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
      <AttendanceCalendar studentId={activeId} />
    </div>
  );
}
