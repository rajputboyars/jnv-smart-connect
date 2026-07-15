"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { useClassAttendanceReport } from "@/hooks/use-attendance";
import { ClassSectionPicker } from "@/components/attendance/class-section-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
// jspdf/jspdf-autotable and exceljs are large and only needed when the user
// actually clicks an export button — dynamically imported inside the
// handlers below instead of bundled into every visitor's initial page load.

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ClassAttendanceReport() {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());

  const { data: report, isLoading } = useClassAttendanceReport({ classId, sectionId, from, to });

  const chartData = (report ?? []).map((r) => ({ name: r.student.name.split(" ")[0], percentage: r.percentage }));

  async function handleExcelExport() {
    if (!report) return;
    const { exportToExcel } = await import("@/lib/export/excel");
    exportToExcel(
      `attendance-report-${from}-to-${to}`,
      "Attendance",
      [
        { header: "Admission No.", key: "admissionNumber", width: 16 },
        { header: "Name", key: "name", width: 24 },
        { header: "Present", key: "present", width: 10 },
        { header: "Absent", key: "absent", width: 10 },
        { header: "Late", key: "late", width: 10 },
        { header: "Half day", key: "halfDay", width: 10 },
        { header: "Leave", key: "leave", width: 10 },
        { header: "Attendance %", key: "percentage", width: 14 },
      ],
      report.map((r) => ({
        admissionNumber: r.student.admissionNumber,
        name: r.student.name,
        present: r.present,
        absent: r.absent,
        late: r.late,
        halfDay: r.halfDay,
        leave: r.leave,
        percentage: r.percentage,
      }))
    );
  }

  async function handlePdfExport() {
    if (!report) return;
    const { exportToPdf } = await import("@/lib/export/pdf");
    exportToPdf(
      `attendance-report-${from}-to-${to}`,
      `Attendance Report (${from} to ${to})`,
      [["Admission No.", "Name", "Present", "Absent", "Late", "Half day", "Leave", "%"]],
      report.map((r) => [
        r.student.admissionNumber,
        r.student.name,
        r.present,
        r.absent,
        r.late,
        r.halfDay,
        r.leave,
        `${r.percentage}%`,
      ])
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <ClassSectionPicker
          classId={classId}
          sectionId={sectionId}
          onClassChange={setClassId}
          onSectionChange={setSectionId}
        />
        <div className="space-y-1.5">
          <Label>From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label>To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExcelExport} disabled={!report?.length}>
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handlePdfExport} disabled={!report?.length}>
            <FileText className="size-4" /> PDF
          </Button>
        </div>
      </div>

      {!classId || !sectionId ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Select a class and section to view the report.
        </p>
      ) : isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <>
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="percentage" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Half day</TableHead>
                <TableHead>Leave</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No attendance recorded for this range.
                  </TableCell>
                </TableRow>
              )}
              {report?.map((row) => (
                <TableRow key={row.student.id}>
                  <TableCell className="font-medium">{row.student.name}</TableCell>
                  <TableCell>{row.present}</TableCell>
                  <TableCell>{row.absent}</TableCell>
                  <TableCell>{row.late}</TableCell>
                  <TableCell>{row.halfDay}</TableCell>
                  <TableCell>{row.leave}</TableCell>
                  <TableCell>
                    <Badge variant={row.percentage >= 75 ? "success" : row.percentage >= 50 ? "warning" : "destructive"}>
                      {row.percentage}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
