"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { useHostelBuildings, useHostelRoster, useSubmitHostelAttendance } from "@/hooks/use-hostel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initials } from "@/lib/utils";
import { HOSTEL_NIGHT_STATUSES, type HostelNightStatus } from "@/models/enums";
import type { HostelRosterEntry } from "@/services/hostel.service";

function today() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_LABELS: Record<HostelNightStatus, string> = {
  present: "Present",
  absent: "Absent",
  on_leave: "On leave",
};

export function NightAttendancePanel() {
  const { data: buildings = [] } = useHostelBuildings();
  const [buildingId, setBuildingId] = useState("");
  const [date, setDate] = useState(today());

  const { data: roster, isLoading } = useHostelRoster(buildingId, date);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label>Building</Label>
          <Select value={buildingId} onValueChange={setBuildingId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select building" />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
        </div>
      </div>

      {!buildingId ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Select a building to mark attendance.</p>
      ) : isLoading || !roster ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <NightAttendanceGrid key={`${buildingId}-${date}`} buildingId={buildingId} date={date} initialRoster={roster} />
      )}
    </div>
  );
}

function NightAttendanceGrid({
  buildingId,
  date,
  initialRoster,
}: {
  buildingId: string;
  date: string;
  initialRoster: HostelRosterEntry[];
}) {
  const [rows, setRows] = useState(initialRoster);
  const submitMutation = useSubmitHostelAttendance();

  function updateRow(studentId: string, patch: Partial<HostelRosterEntry>) {
    setRows((prev) => prev.map((row) => (row.student.id === studentId ? { ...row, ...patch } : row)));
  }

  function markAll(status: HostelNightStatus) {
    setRows((prev) => prev.map((row) => ({ ...row, status })));
  }

  function handleSave() {
    submitMutation.mutate({
      building: buildingId,
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
      <Button variant="outline" size="sm" onClick={() => markAll("present")}>
        <CheckCheck className="size-4" /> Mark all present
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                No allocated students in this building.
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow key={row.student.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    {row.student.photoUrl ? <AvatarImage src={row.student.photoUrl} alt={row.student.name} /> : null}
                    <AvatarFallback className="text-xs">{initials(row.student.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{row.student.name}</span>
                </div>
              </TableCell>
              <TableCell>{row.room?.roomNumber ?? "—"}</TableCell>
              <TableCell>
                <Select value={row.status} onValueChange={(v) => updateRow(row.student.id, { status: v as HostelNightStatus })}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOSTEL_NIGHT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
