"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { useTeacherRoster, useSubmitTeacherAttendance } from "@/hooks/use-attendance";
import { AttendanceStatusSelect } from "@/components/attendance/status-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initials } from "@/lib/utils";
import type { AttendanceStatus } from "@/models/enums";
import type { TeacherRosterEntry } from "@/services/attendance.service";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function MarkTeacherAttendance() {
  const [date, setDate] = useState(today());
  const { data: roster, isLoading } = useTeacherRoster(date);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
        </div>
      </div>

      {isLoading || !roster ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <TeacherAttendanceGrid key={date} date={date} initialRoster={roster} />
      )}
    </div>
  );
}

function TeacherAttendanceGrid({
  date,
  initialRoster,
}: {
  date: string;
  initialRoster: TeacherRosterEntry[];
}) {
  const [rows, setRows] = useState(initialRoster);
  const submitMutation = useSubmitTeacherAttendance();

  function updateRow(teacherId: string, patch: Partial<TeacherRosterEntry>) {
    setRows((prev) =>
      prev.map((row) => (row.teacher.id === teacherId ? { ...row, ...patch } : row))
    );
  }

  function markAll(status: AttendanceStatus) {
    setRows((prev) => prev.map((row) => ({ ...row, status })));
  }

  function handleSave() {
    submitMutation.mutate({
      date,
      records: rows.map((row) => ({
        teacher: row.teacher.id,
        status: row.status,
        remarks: row.remarks || undefined,
      })),
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => markAll("present")}>
        <CheckCheck className="size-4" /> Mark all present
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                No active teachers found.
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow key={row.teacher.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    {row.teacher.photoUrl ? (
                      <AvatarImage src={row.teacher.photoUrl} alt={row.teacher.name} />
                    ) : null}
                    <AvatarFallback className="text-xs">{initials(row.teacher.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{row.teacher.name}</span>
                </div>
              </TableCell>
              <TableCell>{row.teacher.employeeId}</TableCell>
              <TableCell>
                <AttendanceStatusSelect
                  value={row.status}
                  onChange={(status) => updateRow(row.teacher.id, { status })}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.remarks}
                  onChange={(e) => updateRow(row.teacher.id, { remarks: e.target.value })}
                  placeholder="Optional"
                  className="w-48"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={submitMutation.isPending} disabled={rows.length === 0}>
          Save attendance
        </Button>
      </div>
    </>
  );
}
