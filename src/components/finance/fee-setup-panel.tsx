"use client";

import { useState } from "react";
import { Plus, Trash2, Receipt } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFeeCategorySchema,
  type CreateFeeCategoryInput,
  createFeeStructureSchema,
  type CreateFeeStructureInput,
} from "@/validators/finance.validator";
import {
  useFeeCategories,
  useCreateFeeCategory,
  useDeleteFeeCategory,
  useFeeStructures,
  useCreateFeeStructure,
  useDeleteFeeStructure,
  useGenerateInvoices,
} from "@/hooks/use-finance";
import { useClassOptions, useAcademicYears } from "@/hooks/use-academics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/utils";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const categoryDefaults: CreateFeeCategoryInput = {
  name: "",
  code: "",
  frequency: "annual",
  description: "",
};

function FeeCategoryDialog({ onDone }: { onDone: () => void }) {
  const form = useForm<CreateFeeCategoryInput>({
    resolver: zodResolver(createFeeCategorySchema),
    defaultValues: categoryDefaults,
  });
  const mutation = useCreateFeeCategory();

  function onSubmit(values: CreateFeeCategoryInput) {
    mutation.mutate(values, { onSuccess: () => { onDone(); form.reset(categoryDefaults); } });
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add fee category</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Tuition Fee" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="TUI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one_time">One time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" loading={mutation.isPending}>
              Add category
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

const structureDefaults: CreateFeeStructureInput = {
  academicYear: "",
  class: "",
  feeCategory: "",
  amount: 0,
  installments: 1,
  dueDate: "",
  lateFeePerDay: 0,
  maxLateFee: 0,
};

function FeeStructureDialog({ onDone }: { onDone: () => void }) {
  const { data: classes = [] } = useClassOptions();
  const { data: years = [] } = useAcademicYears();
  const { data: categories = [] } = useFeeCategories();
  const form = useForm<CreateFeeStructureInput>({
    resolver: zodResolver(createFeeStructureSchema),
    defaultValues: structureDefaults,
  });
  const mutation = useCreateFeeStructure();

  function onSubmit(values: CreateFeeStructureInput) {
    mutation.mutate(values, { onSuccess: () => { onDone(); form.reset(structureDefaults); } });
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add fee structure</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic year</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y.id} value={y.id}>
                          {y.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="feeCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (total)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Installments</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First due date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="lateFeePerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late fee / day</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxLateFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max late fee</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" loading={mutation.isPending}>
              Create structure
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

export function FeeSetupPanel() {
  const { data: categories = [], isLoading: loadingCategories } = useFeeCategories();
  const { data: structures = [], isLoading: loadingStructures } = useFeeStructures();
  const deleteCategoryMutation = useDeleteFeeCategory();
  const deleteStructureMutation = useDeleteFeeStructure();
  const generateMutation = useGenerateInvoices();

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [structureDialogOpen, setStructureDialogOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteStructureId, setDeleteStructureId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Fee categories</CardTitle>
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Add category
              </Button>
            </DialogTrigger>
            <FeeCategoryDialog onDone={() => setCategoryDialogOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCategories && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!loadingCategories && categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No fee categories yet.
                  </TableCell>
                </TableRow>
              )}
              {categories.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.code}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{c.frequency.replace("_", " ")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setDeleteCategoryId(c._id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Fee structures</CardTitle>
          <Dialog open={structureDialogOpen} onOpenChange={setStructureDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Add structure
              </Button>
            </DialogTrigger>
            <FeeStructureDialog onDone={() => setStructureDialogOpen(false)} />
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Installments</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingStructures && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!loadingStructures && structures.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No fee structures yet.
                  </TableCell>
                </TableRow>
              )}
              {structures.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium">{s.class.name}</TableCell>
                  <TableCell>{s.feeCategory.name}</TableCell>
                  <TableCell>₹{s.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{s.installments}</TableCell>
                  <TableCell>{formatDate(s.dueDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        loading={generateMutation.isPending}
                        onClick={() => generateMutation.mutate(s._id)}
                      >
                        <Receipt className="size-4" /> Generate invoices
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteStructureId(s._id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteCategoryId}
        onOpenChange={(open) => !open && setDeleteCategoryId(null)}
        title="Remove fee category?"
        description="This can only be removed if no fee structures use it."
        confirmLabel="Remove"
        destructive
        loading={deleteCategoryMutation.isPending}
        onConfirm={() => {
          if (deleteCategoryId) deleteCategoryMutation.mutate(deleteCategoryId, { onSuccess: () => setDeleteCategoryId(null) });
        }}
      />
      <ConfirmDialog
        open={!!deleteStructureId}
        onOpenChange={(open) => !open && setDeleteStructureId(null)}
        title="Remove fee structure?"
        description="This can only be removed if no invoices have been generated from it yet."
        confirmLabel="Remove"
        destructive
        loading={deleteStructureMutation.isPending}
        onConfirm={() => {
          if (deleteStructureId) deleteStructureMutation.mutate(deleteStructureId, { onSuccess: () => setDeleteStructureId(null) });
        }}
      />
    </div>
  );
}
