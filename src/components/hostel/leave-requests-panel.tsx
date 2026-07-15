"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Check, X } from "lucide-react";
import {
  createLeaveRequestSchema,
  type CreateLeaveRequestInput,
} from "@/validators/hostel.validator";
import { useLeaveRequests, useCreateLeaveRequest, useReviewLeaveRequest } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { ROLES } from "@/types/roles";
import { StudentPicker, type PickedStudent } from "@/components/shared/student-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "default" | "success" | "destructive" | "outline"> = {
  pending: "default",
  approved: "success",
  rejected: "destructive",
  cancelled: "outline",
};

export function LeaveRequestsPanel() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useLeaveRequests();
  const [dialogOpen, setDialogOpen] = useState(false);
  const reviewMutation = useReviewLeaveRequest();

  const canReview = user && can(user.role, PERMISSIONS.HOSTEL_MANAGE);
  const canRequest = user && (user.role === ROLES.PARENT || user.role === ROLES.STUDENT || canReview);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Hostel leave requests and approvals.</p>
        {canRequest && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Request leave
              </Button>
            </DialogTrigger>
            <RequestDialog onDone={() => setDialogOpen(false)} />
          </Dialog>
        )}
      </div>

      {isLoading && <Skeleton className="h-48 w-full rounded-xl" />}
      {!isLoading && requests?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No leave requests yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {requests?.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{r.student.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(r.fromDate)} — {formatDate(r.toDate)}
                </p>
                <p className="mt-1 text-sm">{r.reason}</p>
                {r.reviewNote && (
                  <p className="mt-1 text-xs text-muted-foreground">Note: {r.reviewNote}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                {canReview && r.status === "pending" && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => reviewMutation.mutate({ id: r.id, status: "approved" })}
                    >
                      <Check className="size-4 text-success" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => reviewMutation.mutate({ id: r.id, status: "rejected" })}
                    >
                      <X className="size-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RequestDialog({ onDone }: { onDone: () => void }) {
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const createMutation = useCreateLeaveRequest();

  const form = useForm<Omit<CreateLeaveRequestInput, "student">>({
    resolver: zodResolver(createLeaveRequestSchema.omit({ student: true })),
    defaultValues: { fromDate: "", toDate: "", reason: "" },
  });

  function onSubmit(values: Omit<CreateLeaveRequestInput, "student">) {
    if (!student) return;
    createMutation.mutate(
      { ...values, student: student.id },
      {
        onSuccess: () => {
          onDone();
          form.reset();
          setStudent(null);
        },
      }
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Request hostel leave</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <StudentPicker value={student} onChange={setStudent} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" loading={createMutation.isPending} disabled={!student}>
                Submit request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </DialogContent>
  );
}
