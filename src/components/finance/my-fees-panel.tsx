"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { useInvoices } from "@/hooks/use-finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceDetailDialog } from "@/components/finance/invoice-detail-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

function statusVariant(status: string): "success" | "warning" | "destructive" | "outline" | "secondary" {
  if (status === "paid") return "success";
  if (status === "overdue") return "destructive";
  if (status === "partial") return "warning";
  if (status === "cancelled") return "outline";
  return "secondary";
}

export function MyFeesPanel() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const { data, isLoading } = useInvoices({ page: 1, limit: 50 });

  const totalDue = (data?.items ?? []).reduce((sum, i) => {
    const balance = i.amount - i.discountAmount - i.waiverAmount + i.lateFeeAmount - i.paidAmount;
    return sum + Math.max(0, balance);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Total outstanding balance</p>
        <p className="text-2xl font-semibold text-primary">₹{totalDue.toLocaleString("en-IN")}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fee</TableHead>
            <TableHead>Installment</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due</TableHead>
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
          {!isLoading && data?.items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No fee invoices yet.
              </TableCell>
            </TableRow>
          )}
          {data?.items.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell className="font-medium">{invoice.feeCategory.name}</TableCell>
              <TableCell>
                {invoice.installmentNumber}/{invoice.totalInstallments}
              </TableCell>
              <TableCell>₹{invoice.amount.toLocaleString("en-IN")}</TableCell>
              <TableCell>{formatDate(invoice.dueDate)}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => setSelectedInvoiceId(invoice._id)}>
                  <Eye className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <InvoiceDetailDialog invoiceId={selectedInvoiceId} onOpenChange={(open) => !open && setSelectedInvoiceId(null)} />
    </div>
  );
}
