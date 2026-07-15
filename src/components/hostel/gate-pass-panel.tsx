"use client";

import { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { useGatePasses, useIssueGatePass, useReturnGatePass } from "@/hooks/use-hostel";
import { StudentPicker, type PickedStudent } from "@/components/shared/student-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning"> = {
  issued: "default",
  returned: "success",
  overdue: "warning",
};

export function GatePassPanel() {
  const { data: passes, isLoading } = useGatePasses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const returnMutation = useReturnGatePass();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Students currently out or recently returned.</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> Issue gate pass
            </Button>
          </DialogTrigger>
          <IssueDialog onDone={() => setDialogOpen(false)} />
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Out</TableHead>
            <TableHead>Expected in</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6}>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && passes?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No gate passes yet.
              </TableCell>
            </TableRow>
          )}
          {passes?.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.student.name}</TableCell>
              <TableCell>{p.purpose}</TableCell>
              <TableCell>{formatDate(p.outTime, { hour: "2-digit", minute: "2-digit" })}</TableCell>
              <TableCell>{formatDate(p.expectedInTime, { hour: "2-digit", minute: "2-digit" })}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {p.status === "issued" && (
                  <Button variant="ghost" size="icon" onClick={() => returnMutation.mutate(p.id)}>
                    <CheckCircle2 className="size-4 text-success" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function IssueDialog({ onDone }: { onDone: () => void }) {
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const [purpose, setPurpose] = useState("");
  const [expectedInTime, setExpectedInTime] = useState("");
  const issueMutation = useIssueGatePass();

  function handleSubmit() {
    if (!student || !purpose || !expectedInTime) return;
    issueMutation.mutate(
      { student: student.id, purpose, expectedInTime },
      {
        onSuccess: () => {
          onDone();
          setStudent(null);
          setPurpose("");
          setExpectedInTime("");
        },
      }
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Issue gate pass</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <StudentPicker value={student} onChange={setStudent} />
        <div className="space-y-1.5">
          <Label>Purpose</Label>
          <Textarea rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Expected return time</Label>
          <Input
            type="datetime-local"
            value={expectedInTime}
            onChange={(e) => setExpectedInTime(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={handleSubmit}
          loading={issueMutation.isPending}
          disabled={!student || !purpose || !expectedInTime}
        >
          Issue pass
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
