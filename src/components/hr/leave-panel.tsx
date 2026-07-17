"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { useStaffLeaveRequests, useCreateStaffLeaveRequest, useReviewStaffLeaveRequest } from "@/hooks/use-hr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { LeaveRequestStatus, StaffLeaveType } from "@/models/enums";

const LEAVE_TYPES: { value: StaffLeaveType; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "sick", label: "Sick" },
  { value: "earned", label: "Earned" },
  { value: "unpaid", label: "Unpaid" },
  { value: "other", label: "Other" },
];

function statusVariant(status: LeaveRequestStatus): "success" | "warning" | "destructive" | "outline" {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "destructive";
  return "outline";
}

function NewLeaveDialog({ onDone }: { onDone: () => void }) {
  const [leaveType, setLeaveType] = useState<StaffLeaveType>("casual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const mutation = useCreateStaffLeaveRequest();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Request leave</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Leave type</Label>
          <Select value={leaveType} onValueChange={(v) => setLeaveType(v as StaffLeaveType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAVE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Reason</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!fromDate || !toDate || !reason.trim()}
          onClick={() =>
            mutation.mutate(
              { leaveType, fromDate, toDate, reason },
              {
                onSuccess: () => {
                  onDone();
                  setFromDate("");
                  setToDate("");
                  setReason("");
                },
              }
            )
          }
        >
          Submit
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function LeavePanel() {
  const { user } = useAuth();
  const canManage = !!user && can(user.role, PERMISSIONS.HR_MANAGE);
  const { data: requests = [], isLoading } = useStaffLeaveRequests();
  const reviewMutation = useReviewStaffLeaveRequest();
  const [dialogOpen, setDialogOpen] = useState(false);

  const colSpan = canManage ? 6 : 5;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{canManage ? "Staff leave requests" : "My leave"}</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> Request leave
            </Button>
          </DialogTrigger>
          <NewLeaveDialog onDone={() => setDialogOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {canManage && <TableHead>Teacher</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={colSpan}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                  No leave requests yet.
                </TableCell>
              </TableRow>
            )}
            {requests.map((r) => (
              <TableRow key={r._id}>
                {canManage && (
                  <TableCell className="font-medium">
                    {r.teacher.name}
                    <div className="text-xs text-muted-foreground">{r.teacher.employeeId}</div>
                  </TableCell>
                )}
                <TableCell className="capitalize">{r.leaveType}</TableCell>
                <TableCell>{formatDate(r.fromDate)}</TableCell>
                <TableCell>{formatDate(r.toDate)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    {r.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          loading={reviewMutation.isPending}
                          onClick={() => reviewMutation.mutate({ id: r._id, status: "approved" })}
                        >
                          <Check className="size-4 text-success" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          loading={reviewMutation.isPending}
                          onClick={() => reviewMutation.mutate({ id: r._id, status: "rejected" })}
                        >
                          <X className="size-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
