"use client";

import { RotateCcw, Check, X } from "lucide-react";
import { useRefunds, useReviewRefund } from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { RefundStatus } from "@/models/enums";

function statusVariant(status: RefundStatus): "success" | "warning" | "destructive" | "outline" {
  if (status === "processed") return "success";
  if (status === "approved") return "warning";
  if (status === "rejected") return "destructive";
  return "outline";
}

export function RefundsPanel() {
  const { data: refunds = [], isLoading } = useRefunds();
  const reviewMutation = useReviewRefund();

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <RotateCcw className="size-4" />
        <CardTitle>Refund requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested by</TableHead>
              <TableHead>Requested on</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && refunds.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No refund requests.
                </TableCell>
              </TableRow>
            )}
            {refunds.map((r) => (
              <TableRow key={r._id}>
                <TableCell className="font-medium">
                  {r.student.name}
                  <span className="ml-2 text-xs text-muted-foreground">{r.student.admissionNumber}</span>
                </TableCell>
                <TableCell>₹{r.amount.toLocaleString("en-IN")}</TableCell>
                <TableCell className="max-w-xs truncate">{r.reason}</TableCell>
                <TableCell>{r.requestedBy.name}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                </TableCell>
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
                  {r.status === "approved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={reviewMutation.isPending}
                      onClick={() => reviewMutation.mutate({ id: r._id, status: "processed" })}
                    >
                      Mark processed
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
