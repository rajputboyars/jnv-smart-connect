"use client";

import { useState } from "react";
import { CheckCheck, QrCode } from "lucide-react";
import { useStudentRoster, useSubmitStudentAttendance } from "@/hooks/use-attendance";
import { ClassSectionPicker } from "@/components/attendance/class-section-picker";
import { AttendanceStatusSelect } from "@/components/attendance/status-select";
import { QrSessionDialog } from "@/components/attendance/qr-session-dialog";
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
import type { StudentRosterEntry } from "@/services/attendance.service";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function MarkStudentAttendance() {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(today());
  const [qrOpen, setQrOpen] = useState(false);

  const { data: roster, isLoading } = useStudentRoster(classId, sectionId, date);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <ClassSectionPicker
            classId={classId}
            sectionId={sectionId}
            onClassChange={setClassId}
            onSectionChange={setSectionId}
          />
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
          </div>
        </div>
        {classId && sectionId && (
          <Button variant="outline" onClick={() => setQrOpen(true)}>
            <QrCode className="size-4" /> Generate QR
          </Button>
        )}
      </div>

      {!classId || !sectionId ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Select a class and section to mark attendance.
        </p>
      ) : isLoading || !roster ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <StudentAttendanceGrid
          key={`${classId}-${sectionId}-${date}`}
          classId={classId}
          sectionId={sectionId}
          date={date}
          initialRoster={roster}
        />
      )}

      <QrSessionDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        classId={classId}
        sectionId={sectionId}
        date={date}
      />
    </div>
  );
}

function StudentAttendanceGrid({
  classId,
  sectionId,
  date,
  initialRoster,
}: {
  classId: string;
  sectionId: string;
  date: string;
  initialRoster: StudentRosterEntry[];
}) {
  const [rows, setRows] = useState(initialRoster);
  const submitMutation = useSubmitStudentAttendance();

  function updateRow(studentId: string, patch: Partial<StudentRosterEntry>) {
    setRows((prev) =>
      prev.map((row) => (row.student.id === studentId ? { ...row, ...patch } : row))
    );
  }

  function markAll(status: AttendanceStatus) {
    setRows((prev) => prev.map((row) => ({ ...row, status })));
  }

  function handleSave() {
    submitMutation.mutate({
      class: classId,
      section: sectionId,
      date,
      records: rows.map((row) => ({
        student: row.student.id,
        status: row.status,
        remarks: row.remarks || undefined,
      })),
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => markAll("present")}>
          <CheckCheck className="size-4" /> Mark all present
        </Button>
        <Button variant="outline" size="sm" onClick={() => markAll("absent")}>
          Mark all absent
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Roll No.</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                No active students in this section.
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow key={row.student.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    {row.student.photoUrl ? (
                      <AvatarImage src={row.student.photoUrl} alt={row.student.name} />
                    ) : null}
                    <AvatarFallback className="text-xs">{initials(row.student.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{row.student.name}</span>
                </div>
              </TableCell>
              <TableCell>{row.student.rollNumber ?? "—"}</TableCell>
              <TableCell>
                <AttendanceStatusSelect
                  value={row.status}
                  onChange={(status) => updateRow(row.student.id, { status })}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.remarks}
                  onChange={(e) => updateRow(row.student.id, { remarks: e.target.value })}
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
