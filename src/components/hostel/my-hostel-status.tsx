"use client";

import { useQuery } from "@tanstack/react-query";
import { BedDouble, Phone } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useHostelAttendanceHistory } from "@/hooks/use-hostel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface MyAllocation {
  room: {
    roomNumber: string;
    floor: number;
    building: { name: string; code: string; warden?: { name: string; phone?: string } };
  };
  bedNumber: number;
  allocatedAt: string;
}

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function MyHostelStatus({ studentId }: { studentId?: string }) {
  const { data: allocation, isLoading } = useQuery({
    queryKey: ["hostel", "my-allocation", studentId],
    queryFn: async () => {
      const params = studentId ? `?studentId=${studentId}` : "";
      const res = await apiFetch<MyAllocation | null>(`/api/hostel/my-allocation${params}`);
      return res.data ?? null;
    },
  });

  const { data: history } = useHostelAttendanceHistory({
    studentId,
    from: firstOfMonth(),
    to: today(),
  });

  if (isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (!allocation) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No hostel room allocated yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="size-4" /> Room details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Building:</span> {allocation.room.building.name}
          </p>
          <p>
            <span className="text-muted-foreground">Room:</span> {allocation.room.roomNumber} (Floor{" "}
            {allocation.room.floor})
          </p>
          <p>
            <span className="text-muted-foreground">Bed:</span> {allocation.bedNumber}
          </p>
          <p>
            <span className="text-muted-foreground">Since:</span> {formatDate(allocation.allocatedAt)}
          </p>
          {allocation.room.building.warden && (
            <p className="flex items-center gap-1 pt-1 text-muted-foreground">
              <Phone className="size-3.5" /> Warden: {allocation.room.building.warden.name}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Night attendance (this month)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold">{history?.percentage ?? 0}%</span>
            <Badge variant={((history?.percentage ?? 0) >= 90) ? "success" : "warning"}>present</Badge>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            {(history?.records ?? []).slice(-5).reverse().map((r) => (
              <div key={r.date} className="flex justify-between">
                <span>{formatDate(r.date)}</span>
                <span className="capitalize">{r.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
