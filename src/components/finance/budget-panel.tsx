"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useBudgets, useCreateBudget } from "@/hooks/use-finance";
import { useAcademicYears } from "@/hooks/use-academics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

function NewBudgetDialog({ years, onDone }: { years: { id: string; name: string }[]; onDone: () => void }) {
  const [academicYear, setAcademicYear] = useState("");
  const [category, setCategory] = useState("");
  const [allocatedAmount, setAllocatedAmount] = useState("");
  const [notes, setNotes] = useState("");
  const mutation = useCreateBudget();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add budget line</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Academic year</Label>
          <Select value={academicYear} onValueChange={setAcademicYear}>
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Maintenance" />
          </div>
          <div className="space-y-1.5">
            <Label>Allocated amount</Label>
            <Input
              type="number"
              min={0}
              value={allocatedAmount}
              onChange={(e) => setAllocatedAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Notes (optional)</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!academicYear || !category.trim() || !allocatedAmount}
          onClick={() =>
            mutation.mutate(
              { academicYear, category, allocatedAmount: Number(allocatedAmount), notes },
              { onSuccess: () => { onDone(); setCategory(""); setAllocatedAmount(""); setNotes(""); } }
            )
          }
        >
          Add budget
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function BudgetPanel() {
  const { data: years = [] } = useAcademicYears();
  const [yearFilter, setYearFilter] = useState<string>("all");
  const { data: budgets = [], isLoading } = useBudgets(yearFilter === "all" ? undefined : yearFilter);
  const [dialogOpen, setDialogOpen] = useState(false);

  const chartData = budgets.map((b) => ({
    category: b.category,
    Allocated: b.allocatedAmount,
    Spent: b.spentAmount,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Budget vs. actual spend</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4" /> Add budget
                </Button>
              </DialogTrigger>
              <NewBudgetDialog years={years} onDone={() => setDialogOpen(false)} />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-64 w-full" />}
          {!isLoading && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Allocated" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Spent" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {!isLoading && chartData.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No budget lines yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{b.category}</TableCell>
                  <TableCell>{b.academicYear.name}</TableCell>
                  <TableCell>₹{b.allocatedAmount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>₹{b.spentAmount.toLocaleString("en-IN")}</TableCell>
                  <TableCell className={b.allocatedAmount - b.spentAmount < 0 ? "text-destructive" : ""}>
                    ₹{(b.allocatedAmount - b.spentAmount).toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
