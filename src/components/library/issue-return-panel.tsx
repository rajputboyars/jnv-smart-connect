"use client";

import { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { useBookIssues, useIssueBook, useReturnBook } from "@/hooks/use-library";
import { StudentPicker, type PickedStudent } from "@/components/shared/student-picker";
import { BookPicker, type PickedBook } from "@/components/library/book-picker";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/utils";

export function IssueReturnPanel() {
  const { data: issues, isLoading } = useBookIssues();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [returnId, setReturnId] = useState<string | null>(null);
  const returnMutation = useReturnBook();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Currently issued and recently returned books.</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> Issue book
            </Button>
          </DialogTrigger>
          <IssueDialog onDone={() => setDialogOpen(false)} />
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Book</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5}>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && issues?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                No issues yet.
              </TableCell>
            </TableRow>
          )}
          {issues?.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell className="font-medium">{issue.book.title}</TableCell>
              <TableCell>{issue.student.name}</TableCell>
              <TableCell>{formatDate(issue.dueDate)}</TableCell>
              <TableCell>
                {issue.status === "issued" && issue.overdueDays > 0 ? (
                  <Badge variant="warning">{issue.overdueDays}d overdue</Badge>
                ) : (
                  <Badge variant={issue.status === "returned" ? "outline" : "success"}>{issue.status}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {issue.status === "issued" && (
                  <Button variant="ghost" size="icon" onClick={() => setReturnId(issue.id)}>
                    <CheckCircle2 className="size-4 text-success" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={!!returnId}
        onOpenChange={(open) => !open && setReturnId(null)}
        title="Mark as returned?"
        description="Any overdue fine will be calculated automatically."
        confirmLabel="Confirm return"
        loading={returnMutation.isPending}
        onConfirm={() => {
          if (returnId) returnMutation.mutate({ id: returnId, finePaid: false }, { onSuccess: () => setReturnId(null) });
        }}
      />
    </div>
  );
}

function IssueDialog({ onDone }: { onDone: () => void }) {
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const [book, setBook] = useState<PickedBook | null>(null);
  const [dueDate, setDueDate] = useState("");
  const issueMutation = useIssueBook();

  function handleSubmit() {
    if (!student || !book || !dueDate) return;
    issueMutation.mutate(
      { book: book.id, student: student.id, dueDate },
      {
        onSuccess: () => {
          onDone();
          setStudent(null);
          setBook(null);
          setDueDate("");
        },
      }
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Issue a book</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <BookPicker value={book} onChange={setBook} />
        <StudentPicker value={student} onChange={setStudent} />
        <div className="space-y-1.5">
          <Label>Due date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} loading={issueMutation.isPending} disabled={!student || !book || !dueDate}>
          Issue
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
