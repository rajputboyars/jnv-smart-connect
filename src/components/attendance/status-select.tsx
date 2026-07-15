"use client";

import { ATTENDANCE_STATUSES, type AttendanceStatus } from "@/models/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  half_day: "Half day",
  leave: "On leave",
};

export function AttendanceStatusSelect({
  value,
  onChange,
}: {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as AttendanceStatus)}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ATTENDANCE_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { LABELS as ATTENDANCE_STATUS_LABELS };
