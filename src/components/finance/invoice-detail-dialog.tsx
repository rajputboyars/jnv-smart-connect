"use client";

import { useState } from "react";
import { Download, CreditCard, ShieldMinus, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { useInvoice, useRecordPayment, useCreateWaiver, useCreateRefund } from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatDate } from "@/lib/utils";
import type { PaymentMethod } from "@/models/enums";

function statusVariant(status: string): "success" | "warning" | "destructive" | "outline" | "secondary" {
  if (status === "paid") return "success";
  if (status === "overdue") return "destructive";
  if (status === "partial") return "warning";
  if (status === "cancelled") return "outline";
  return "secondary";
}

export function InvoiceDetailDialog({
  invoiceId,
  onOpenChange,
}: {
  invoiceId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { data, isLoading } = useInvoice(invoiceId ?? "");
  const canManage = !!user && can(user.role, PERMISSIONS.ACCOUNTS_MANAGE);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [transactionRef, setTransactionRef] = useState("");
  const [waiverAmount, setWaiverAmount] = useState("");
  const [waiverReason, setWaiverReason] = useState("");

  const paymentMutation = useRecordPayment(invoiceId ?? "");
  const waiverMutation = useCreateWaiver(invoiceId ?? "");
  const refundMutation = useCreateRefund();
  const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  async function handleDownloadReceipt(paymentId: string) {
    const { exportReceiptPdf } = await import("@/lib/export/pdf");
    const { fetchReceipt } = await import("@/services/finance.service");
    const data = await fetchReceipt(paymentId);
    exportReceiptPdf(`receipt-${data.payment.receiptNumber}`, {
      schoolName: data.school?.name ?? "JNV Smart Connect",
      schoolAddress: data.school?.address,
      documentTitle: "Fee Payment Receipt",
      documentNumber: data.payment.receiptNumber,
      date: formatDate(data.payment.paidAt),
      billedTo: [
        { label: "Student", value: data.payment.student.name },
        { label: "Admission No.", value: data.payment.student.admissionNumber },
        { label: "Class", value: `${data.payment.student.currentClass?.name ?? ""}-${data.payment.student.section?.name ?? ""}` },
      ],
      lineItems: [
        {
          label: `${data.payment.invoice.feeCategory.name} — Installment ${data.payment.invoice.installmentNumber}/${data.payment.invoice.totalInstallments}`,
          amount: data.payment.amount,
        },
      ],
      totalLabel: "Amount paid",
      footerNote: `Payment method: ${data.payment.method.toUpperCase()} · Received by: ${data.payment.receivedBy.name}`,
    });
  }

  return (
    <Dialog open={!!invoiceId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice detail</DialogTitle>
        </DialogHeader>

        {isLoading && <Skeleton className="h-64 w-full" />}

        {data && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium">{data.invoice.student.name}</p>
                <p className="text-xs text-muted-foreground">
                  {data.invoice.student.admissionNumber} · {data.invoice.feeCategory.name} · Installment{" "}
                  {data.invoice.installmentNumber}/{data.invoice.totalInstallments}
                </p>
              </div>
              <Badge variant={statusVariant(data.invoice.status)}>{data.invoice.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">₹{data.invoice.amount.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Discount + Waiver</p>
                <p className="font-medium">
                  ₹{(data.invoice.discountAmount + data.invoice.waiverAmount).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Late fee</p>
                <p className="font-medium">₹{data.invoice.lateFeeAmount.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Paid</p>
                <p className="font-medium">₹{data.invoice.paidAmount.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance</p>
                <p className="font-semibold text-primary">₹{data.balance.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due date</p>
                <p className="font-medium">{formatDate(data.invoice.dueDate)}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Payment history</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No payments yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {data.payments.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-mono text-xs">{p.receiptNumber}</TableCell>
                      <TableCell>₹{p.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="uppercase">{p.method}</TableCell>
                      <TableCell>{formatDate(p.paidAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadReceipt(p._id)}>
                          <Download className="size-4" />
                        </Button>
                        {canManage && (
                          <Button variant="ghost" size="icon" onClick={() => setRefundPaymentId(p._id)}>
                            <RotateCcw className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {canManage && refundPaymentId && (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <p className="text-sm font-medium">Request refund for this payment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Amount</Label>
                    <Input type="number" min={0} value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reason</Label>
                    <Input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setRefundPaymentId(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    loading={refundMutation.isPending}
                    disabled={!refundAmount || Number(refundAmount) <= 0 || refundReason.trim().length < 3}
                    onClick={() =>
                      refundMutation.mutate(
                        { payment: refundPaymentId, amount: Number(refundAmount), reason: refundReason },
                        {
                          onSuccess: () => {
                            setRefundPaymentId(null);
                            setRefundAmount("");
                            setRefundReason("");
                          },
                        }
                      )
                    }
                  >
                    Submit refund request
                  </Button>
                </div>
              </div>
            )}

            {canManage && data.balance > 0 && (
              <div className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <CreditCard className="size-4" /> Record payment
                  </p>
                  <div className="space-y-1.5">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      min={0}
                      max={data.balance}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Method</Label>
                    <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reference (optional)</Label>
                    <Input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} />
                  </div>
                  <Button
                    className="w-full"
                    loading={paymentMutation.isPending}
                    disabled={!paymentAmount || Number(paymentAmount) <= 0}
                    onClick={() =>
                      paymentMutation.mutate(
                        { amount: Number(paymentAmount), method: paymentMethod, transactionRef },
                        { onSuccess: () => { setPaymentAmount(""); setTransactionRef(""); } }
                      )
                    }
                  >
                    Record payment
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <ShieldMinus className="size-4" /> Apply waiver
                  </p>
                  <div className="space-y-1.5">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      min={0}
                      max={data.balance}
                      value={waiverAmount}
                      onChange={(e) => setWaiverAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reason</Label>
                    <Textarea value={waiverReason} onChange={(e) => setWaiverReason(e.target.value)} />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    loading={waiverMutation.isPending}
                    disabled={!waiverAmount || Number(waiverAmount) <= 0 || waiverReason.trim().length < 3}
                    onClick={() =>
                      waiverMutation.mutate(
                        { amount: Number(waiverAmount), reason: waiverReason },
                        { onSuccess: () => { setWaiverAmount(""); setWaiverReason(""); } }
                      )
                    }
                  >
                    Apply waiver
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
