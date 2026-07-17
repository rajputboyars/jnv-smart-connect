"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import { useTeacherOptions } from "@/hooks/use-teachers";
import {
  useSalaryStructures,
  useCreateSalaryStructure,
  usePayslips,
  useGeneratePayslip,
  useUpdatePayslipStatus,
} from "@/hooks/use-hr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PayslipStatus } from "@/models/enums";
import type { SalaryComponentDto } from "@/services/hr.service";

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function statusVariant(status: PayslipStatus): "success" | "warning" | "outline" {
  if (status === "paid") return "success";
  if (status === "generated") return "warning";
  return "outline";
}

function ComponentEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: SalaryComponentDto[];
  onChange: (items: SalaryComponentDto[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...items, { name: "", amount: 0 }])}
        >
          <Plus className="size-4" /> Add
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <Input
            placeholder="Name"
            value={item.name}
            onChange={(e) => onChange(items.map((it, i) => (i === idx ? { ...it, name: e.target.value } : it)))}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={item.amount || ""}
            onChange={(e) =>
              onChange(items.map((it, i) => (i === idx ? { ...it, amount: Number(e.target.value) } : it)))
            }
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(items.filter((_, i) => i !== idx))}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function NewSalaryStructureDialog({ teacherId, onDone }: { teacherId: string; onDone: () => void }) {
  const [basicPay, setBasicPay] = useState("");
  const [allowances, setAllowances] = useState<SalaryComponentDto[]>([]);
  const [deductions, setDeductions] = useState<SalaryComponentDto[]>([]);
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const mutation = useCreateSalaryStructure();

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Set salary structure</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Basic pay</Label>
            <Input type="number" value={basicPay} onChange={(e) => setBasicPay(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Effective from</Label>
            <Input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
          </div>
        </div>
        <ComponentEditor label="Allowances" items={allowances} onChange={setAllowances} />
        <ComponentEditor label="Deductions" items={deductions} onChange={setDeductions} />
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!basicPay || !effectiveFrom}
          onClick={() =>
            mutation.mutate(
              {
                teacher: teacherId,
                basicPay: Number(basicPay),
                allowances: allowances.filter((a) => a.name.trim()),
                deductions: deductions.filter((d) => d.name.trim()),
                effectiveFrom,
              },
              {
                onSuccess: () => {
                  onDone();
                  setBasicPay("");
                  setAllowances([]);
                  setDeductions([]);
                  setEffectiveFrom("");
                },
              }
            )
          }
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function PayrollPanel() {
  const { data: teacherOptions = [] } = useTeacherOptions();
  const [teacherId, setTeacherId] = useState<string>("");
  const [structureDialogOpen, setStructureDialogOpen] = useState(false);

  const { data: structures = [], isLoading: structuresLoading } = useSalaryStructures(teacherId || undefined);
  const now = useMemo(() => new Date(), []);
  const { data: payslips = [], isLoading: payslipsLoading } = usePayslips({ teacher: teacherId || undefined, year: now.getFullYear() });
  const generateMutation = useGeneratePayslip();
  const statusMutation = useUpdatePayslipStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select employee</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Choose a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teacherOptions.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} ({t.employeeId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {teacherId && (
        <>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Salary structure history</CardTitle>
              <Dialog open={structureDialogOpen} onOpenChange={setStructureDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="size-4" /> New structure
                  </Button>
                </DialogTrigger>
                <NewSalaryStructureDialog teacherId={teacherId} onDone={() => setStructureDialogOpen(false)} />
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Effective from</TableHead>
                    <TableHead>Basic pay</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structuresLoading && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!structuresLoading && structures.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        No salary structure set yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {structures.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell>{new Date(s.effectiveFrom).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(s.basicPay)}</TableCell>
                      <TableCell>{formatCurrency(s.allowances.reduce((sum, a) => sum + a.amount, 0))}</TableCell>
                      <TableCell>{formatCurrency(s.deductions.reduce((sum, d) => sum + d.amount, 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Payslips ({now.getFullYear()})</CardTitle>
              <Button
                size="sm"
                loading={generateMutation.isPending}
                onClick={() =>
                  generateMutation.mutate({ teacher: teacherId, month: now.getMonth() + 1, year: now.getFullYear() })
                }
              >
                <FileText className="size-4" /> Generate this month
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslipsLoading && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!payslipsLoading && payslips.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        No payslips generated yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {payslips.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        {p.month}/{p.year}
                      </TableCell>
                      <TableCell>{formatCurrency(p.grossPay)}</TableCell>
                      <TableCell>{formatCurrency(p.netPay)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status === "generated" && (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={statusMutation.isPending}
                            onClick={() => statusMutation.mutate({ id: p._id, status: "paid" })}
                          >
                            Mark paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
