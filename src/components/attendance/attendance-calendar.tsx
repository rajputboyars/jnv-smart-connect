"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStudentAttendanceHistory } from "@/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/models/enums";

const STATUS_DOT: Record<AttendanceStatus, string> = {
  present: "bg-success",
  absent: "bg-destructive",
  late: "bg-warning",
  half_day: "bg-warning",
  leave: "bg-muted-foreground",
};

export function AttendanceCalendar({ studentId }: { studentId?: string }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const from = format(startOfMonth(month), "yyyy-MM-dd");
  const to = format(endOfMonth(month), "yyyy-MM-dd");

  const { data, isLoading } = useStudentAttendanceHistory({ studentId, from, to });

  const statusByDay = new Map((data?.records ?? []).map((r) => [r.date.slice(0, 10), r.status]));

  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile label="Attendance" value={`${data?.percentage ?? 0}%`} />
        <SummaryTile label="Present" value={data?.summary.present ?? 0} />
        <SummaryTile label="Absent" value={data?.summary.absent ?? 0} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{format(month, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="pb-2 font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const status = statusByDay.get(key);
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-transparent text-sm",
                      !isSameMonth(day, month) && "text-muted-foreground/40",
                      isSameDay(day, new Date()) && "border-primary"
                    )}
                  >
                    <span>{format(day, "d")}</span>
                    {status && <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
