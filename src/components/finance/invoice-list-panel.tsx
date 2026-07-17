"use client";

import { useState } from "react";
import { Search, Eye } from "lucide-react";
import { useInvoices } from "@/hooks/use-finance";
import { useClassOptions } from "@/hooks/use-academics";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { InvoiceDetailDialog } from "@/components/finance/invoice-detail-dialog";
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

function statusVariant(status: string): "success" | "warning" | "destructive" | "outline" | "secondary" {
  if (status === "paid") return "success";
  if (status === "overdue") return "destructive";
  if (status === "partial") return "warning";
  if (status === "cancelled") return "outline";
  return "secondary";
}

export function InvoiceListPanel() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [classId, setClassId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const { data: classes = [] } = useClassOptions();
  const { data, isLoading } = useInvoices({
    page,
    limit: 15,
    status: status === "all" ? undefined : status,
    classId: classId === "all" ? undefined : classId,
    search: search || undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search student name, admission no., invoice #"
            className="pl-9"
          />
        </div>
        <Select value={classId} onValueChange={(v) => { setClassId(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Category</TableHead>
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
              <TableCell colSpan={7}>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && data?.items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                No invoices found.
              </TableCell>
            </TableRow>
          )}
          {data?.items.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell className="font-medium">
                {invoice.student.name}
                <span className="ml-2 text-xs text-muted-foreground">{invoice.student.admissionNumber}</span>
              </TableCell>
              <TableCell>{invoice.feeCategory.name}</TableCell>
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

      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          onPageChange={setPage}
        />
      )}

      <InvoiceDetailDialog invoiceId={selectedInvoiceId} onOpenChange={(open) => !open && setSelectedInvoiceId(null)} />
    </div>
  );
}
