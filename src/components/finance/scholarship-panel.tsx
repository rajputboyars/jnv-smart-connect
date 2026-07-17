"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  useScholarships,
  useCreateScholarship,
  useStudentScholarships,
  useAssignScholarship,
  useRevokeScholarship,
} from "@/hooks/use-finance";
import { useAcademicYears } from "@/hooks/use-academics";
import { StudentPicker, type PickedStudent } from "@/components/shared/student-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function NewScholarshipDialog({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [criteria, setCriteria] = useState("");
  const mutation = useCreateScholarship();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add scholarship</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Merit Scholarship" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "percentage" | "fixed")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Value</Label>
            <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Criteria (optional)</Label>
          <Input value={criteria} onChange={(e) => setCriteria(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!name.trim() || !value}
          onClick={() =>
            mutation.mutate(
              { name, type, value: Number(value), criteria },
              { onSuccess: () => { onDone(); setName(""); setValue(""); setCriteria(""); } }
            )
          }
        >
          Add scholarship
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function AssignScholarshipDialog({ onDone }: { onDone: () => void }) {
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const [scholarshipId, setScholarshipId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const { data: scholarships = [] } = useScholarships();
  const { data: years = [] } = useAcademicYears();
  const mutation = useAssignScholarship();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Assign scholarship to student</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <StudentPicker value={student} onChange={setStudent} />
        <div className="space-y-1.5">
          <Label>Scholarship</Label>
          <Select value={scholarshipId} onValueChange={setScholarshipId}>
            <SelectTrigger>
              <SelectValue placeholder="Select scholarship" />
            </SelectTrigger>
            <SelectContent>
              {scholarships.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name} ({s.type === "percentage" ? `${s.value}%` : `₹${s.value}`})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Academic year</Label>
          <Select value={academicYearId} onValueChange={setAcademicYearId}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y.id} value={y.id}>
                  {y.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!student || !scholarshipId || !academicYearId}
          onClick={() =>
            student &&
            mutation.mutate(
              { student: student.id, scholarship: scholarshipId, academicYear: academicYearId },
              { onSuccess: () => { onDone(); setStudent(null); setScholarshipId(""); setAcademicYearId(""); } }
            )
          }
        >
          Assign
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function ScholarshipPanel() {
  const { data: scholarships = [], isLoading } = useScholarships();
  const { data: assignments = [], isLoading: loadingAssignments } = useStudentScholarships();
  const revokeMutation = useRevokeScholarship();
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Scholarships</CardTitle>
          <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Add scholarship
              </Button>
            </DialogTrigger>
            <NewScholarshipDialog onDone={() => setNewDialogOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {isLoading && <Skeleton className="h-8 w-full" />}
          {!isLoading && scholarships.length === 0 && (
            <p className="text-sm text-muted-foreground">No scholarships defined yet.</p>
          )}
          {scholarships.map((s) => (
            <Badge key={s._id} variant="secondary">
              {s.name} — {s.type === "percentage" ? `${s.value}%` : `₹${s.value}`}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Student assignments</CardTitle>
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Assign to student
              </Button>
            </DialogTrigger>
            <AssignScholarshipDialog onDone={() => setAssignDialogOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Scholarship</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Approved by</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAssignments && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!loadingAssignments && assignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No scholarships assigned yet.
                  </TableCell>
                </TableRow>
              )}
              {assignments.map((a) => (
                <TableRow key={a._id}>
                  <TableCell className="font-medium">
                    {a.student.name}
                    <span className="ml-2 text-xs text-muted-foreground">{a.student.admissionNumber}</span>
                  </TableCell>
                  <TableCell>{a.scholarship.name}</TableCell>
                  <TableCell>{a.academicYear.name}</TableCell>
                  <TableCell>{a.approvedBy.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setRevokeId(a._id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!revokeId}
        onOpenChange={(open) => !open && setRevokeId(null)}
        title="Revoke scholarship?"
        description="The student will no longer receive this scholarship's discount on future invoices."
        confirmLabel="Revoke"
        destructive
        loading={revokeMutation.isPending}
        onConfirm={() => {
          if (revokeId) revokeMutation.mutate(revokeId, { onSuccess: () => setRevokeId(null) });
        }}
      />
    </div>
  );
}
