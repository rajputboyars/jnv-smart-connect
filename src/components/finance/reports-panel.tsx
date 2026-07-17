"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  useCashBook,
  useLedger,
  useAuditReport,
  useMonthlyIncomeReport,
  useAnnualReport,
} from "@/hooks/use-finance";
import { useAcademicYears } from "@/hooks/use-academics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function firstOfYear() {
  return `${new Date().getFullYear()}-01-01`;
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

function LedgerView({
  title,
  data,
  isLoading,
  exportName,
}: {
  title: string;
  data: { entries: { date: string; type: string; description: string; method: string; direction: string; amount: number; balance: number }[]; closingBalance: number } | undefined;
  isLoading: boolean;
  exportName: string;
}) {
  async function handleExcelExport() {
    if (!data) return;
    const { exportToExcel } = await import("@/lib/export/excel");
    exportToExcel(
      exportName,
      title,
      [
        { header: "Date", key: "date", width: 14 },
        { header: "Type", key: "type", width: 16 },
        { header: "Description", key: "description", width: 40 },
        { header: "Method", key: "method", width: 12 },
        { header: "Direction", key: "direction", width: 10 },
        { header: "Amount", key: "amount", width: 14 },
        { header: "Balance", key: "balance", width: 14 },
      ],
      data.entries.map((e) => ({ ...e, date: formatDate(e.date) }))
    );
  }

  async function handlePdfExport() {
    if (!data) return;
    const { exportToPdf } = await import("@/lib/export/pdf");
    exportToPdf(
      exportName,
      title,
      [["Date", "Description", "Method", "Direction", "Amount", "Balance"]],
      data.entries.map((e) => [formatDate(e.date), e.description, e.method, e.direction, e.amount, e.balance])
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExcelExport} disabled={!data}>
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handlePdfExport} disabled={!data}>
            <FileText className="size-4" /> PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-64 w-full" />}
        {!isLoading && data && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No transactions in this period.
                    </TableCell>
                  </TableRow>
                )}
                {data.entries.map((e, i) => (
                  <TableRow key={i}>
                    <TableCell>{formatDate(e.date)}</TableCell>
                    <TableCell>{e.description}</TableCell>
                    <TableCell className="uppercase">{e.method}</TableCell>
                    <TableCell className={`text-right ${e.direction === "credit" ? "text-success" : "text-destructive"}`}>
                      {e.direction === "credit" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{e.balance.toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-3 text-right text-sm font-medium">
              Closing balance: ₹{data.closingBalance.toLocaleString("en-IN")}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label>From</Label>
        <Input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>To</Label>
        <Input type="date" value={to} onChange={(e) => onToChange(e.target.value)} />
      </div>
    </div>
  );
}

export function ReportsPanel() {
  const [cashFrom, setCashFrom] = useState(firstOfYear());
  const [cashTo, setCashTo] = useState(today());
  const { data: cashBook, isLoading: loadingCashBook } = useCashBook(cashFrom, cashTo);

  const [ledgerFrom, setLedgerFrom] = useState(firstOfYear());
  const [ledgerTo, setLedgerTo] = useState(today());
  const { data: ledger, isLoading: loadingLedger } = useLedger(ledgerFrom, ledgerTo);

  const [auditFrom, setAuditFrom] = useState(firstOfYear());
  const [auditTo, setAuditTo] = useState(today());
  const { data: audit, isLoading: loadingAudit } = useAuditReport(auditFrom, auditTo);

  const [year, setYear] = useState(new Date().getFullYear());
  const { data: monthly = [], isLoading: loadingMonthly } = useMonthlyIncomeReport(year);

  const { data: years = [] } = useAcademicYears();
  const [annualYearId, setAnnualYearId] = useState("");
  const { data: annual, isLoading: loadingAnnual } = useAnnualReport(annualYearId);

  const monthlyChartData = monthly.map((m) => ({
    month: MONTH_NAMES[m.month - 1],
    "Fee collection": m.feeCollection,
    "Other income": m.otherIncome,
    Donations: m.donations,
  }));

  return (
    <Tabs defaultValue="cash-book">
      <TabsList>
        <TabsTrigger value="cash-book">Cash Book</TabsTrigger>
        <TabsTrigger value="ledger">Ledger</TabsTrigger>
        <TabsTrigger value="monthly">Monthly Income</TabsTrigger>
        <TabsTrigger value="annual">Annual Report</TabsTrigger>
        <TabsTrigger value="audit">Audit Report</TabsTrigger>
      </TabsList>

      <TabsContent value="cash-book" className="space-y-4">
        <DateRangeFilter from={cashFrom} to={cashTo} onFromChange={setCashFrom} onToChange={setCashTo} />
        <LedgerView title="Cash Book" data={cashBook} isLoading={loadingCashBook} exportName="cash-book" />
      </TabsContent>

      <TabsContent value="ledger" className="space-y-4">
        <DateRangeFilter from={ledgerFrom} to={ledgerTo} onFromChange={setLedgerFrom} onToChange={setLedgerTo} />
        <LedgerView title="General Ledger" data={ledger} isLoading={loadingLedger} exportName="general-ledger" />
      </TabsContent>

      <TabsContent value="monthly" className="space-y-4">
        <div className="space-y-1.5">
          <Label>Year</Label>
          <Input
            type="number"
            className="w-32"
            value={year}
            onChange={(e) => setYear(e.target.valueAsNumber || new Date().getFullYear())}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Monthly income — {year}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMonthly && <Skeleton className="h-64 w-full" />}
            {!loadingMonthly && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="Fee collection" stackId="a" fill="var(--color-chart-1)" />
                  <Bar dataKey="Other income" stackId="a" fill="var(--color-chart-2)" />
                  <Bar dataKey="Donations" stackId="a" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="annual" className="space-y-4">
        <div className="space-y-1.5">
          <Label>Academic year</Label>
          <Select value={annualYearId} onValueChange={setAnnualYearId}>
            <SelectTrigger className="w-56">
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
        {loadingAnnual && <Skeleton className="h-64 w-full" />}
        {annual && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Fee collection</span><span>₹{annual.income.feeCollection.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Other income</span><span>₹{annual.income.otherIncome.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Donations</span><span>₹{annual.income.donations.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>₹{annual.income.total.toLocaleString("en-IN")}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {annual.expenses.byCategory.map((c) => (
                  <div key={c.category} className="flex justify-between">
                    <span>{c.category}</span>
                    <span>₹{c.total.toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="flex justify-between"><span>Vendor payments</span><span>₹{annual.expenses.vendorPayments.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>₹{annual.expenses.total.toLocaleString("en-IN")}</span></div>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle>Concessions &amp; net surplus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Waivers</span><span>₹{annual.concessions.waivers.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Refunds</span><span>₹{annual.concessions.refunds.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-primary">
                  <span>Net surplus</span><span>₹{annual.netSurplus.toLocaleString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      <TabsContent value="audit" className="space-y-4">
        <DateRangeFilter from={auditFrom} to={auditTo} onFromChange={setAuditFrom} onToChange={setAuditTo} />
        <LedgerView title="Audit Report" data={audit} isLoading={loadingAudit} exportName="audit-report" />
      </TabsContent>
    </Tabs>
  );
}
