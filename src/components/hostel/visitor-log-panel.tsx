"use client";

import { useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { useVisitorLogs, useCreateVisitorLog, useCheckOutVisitor } from "@/hooks/use-hostel";
import { StudentPicker, type PickedStudent } from "@/components/shared/student-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function VisitorLogPanel() {
  const { data: logs, isLoading } = useVisitorLogs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const checkoutMutation = useCheckOutVisitor();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Visitors to hostel students.</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> Log visitor
            </Button>
          </DialogTrigger>
          <LogVisitorDialog onDone={() => setDialogOpen(false)} />
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Visitor</TableHead>
            <TableHead>Visiting</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Check-in</TableHead>
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
          {!isLoading && logs?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No visitors logged yet.
              </TableCell>
            </TableRow>
          )}
          {logs?.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <p className="font-medium">{v.visitorName}</p>
                <p className="text-xs text-muted-foreground">{v.relation}</p>
              </TableCell>
              <TableCell>{v.student.name}</TableCell>
              <TableCell>{v.purpose}</TableCell>
              <TableCell>{formatDate(v.checkInTime, { hour: "2-digit", minute: "2-digit" })}</TableCell>
              <TableCell>
                <Badge variant={v.checkOutTime ? "outline" : "success"}>
                  {v.checkOutTime ? "Checked out" : "On premises"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {!v.checkOutTime && (
                  <Button variant="ghost" size="icon" onClick={() => checkoutMutation.mutate(v.id)}>
                    <LogOut className="size-4 text-destructive" />
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

function LogVisitorDialog({ onDone }: { onDone: () => void }) {
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [relation, setRelation] = useState("");
  const [purpose, setPurpose] = useState("");
  const createMutation = useCreateVisitorLog();

  const canSubmit = student && visitorName && visitorPhone && relation && purpose;

  function handleSubmit() {
    if (!student || !canSubmit) return;
    createMutation.mutate(
      { student: student.id, visitorName, visitorPhone, relation, purpose },
      {
        onSuccess: () => {
          onDone();
          setStudent(null);
          setVisitorName("");
          setVisitorPhone("");
          setRelation("");
          setPurpose("");
        },
      }
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Log a visitor</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <StudentPicker value={student} onChange={setStudent} placeholder="Which student are they visiting?" />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Visitor name</Label>
            <Input value={visitorName} onChange={(e) => setVisitorName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Relation to student</Label>
          <Input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Father, Uncle…" />
        </div>
        <div className="space-y-1.5">
          <Label>Purpose</Label>
          <Textarea rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} loading={createMutation.isPending} disabled={!canSubmit}>
          Log visitor
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
