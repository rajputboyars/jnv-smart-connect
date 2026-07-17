"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useVendors } from "@/hooks/use-finance";
import { usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrderStatus } from "@/hooks/use-inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/lib/utils";
import type { PurchaseOrderStatus } from "@/models/enums";

function statusVariant(status: PurchaseOrderStatus): "success" | "warning" | "destructive" | "outline" | "secondary" {
  if (status === "received") return "success";
  if (status === "sent") return "warning";
  if (status === "cancelled") return "destructive";
  return "secondary";
}

interface FormValues {
  vendor: string;
  expectedDate: string;
  items: { description: string; quantity: number; unitPrice: number }[];
}

function NewPurchaseOrderDialog({ onDone }: { onDone: () => void }) {
  const { data: vendors = [] } = useVendors();
  const mutation = useCreatePurchaseOrder();
  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { vendor: "", expectedDate: "", items: [{ description: "", quantity: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });
  const total = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

  function onSubmit(values: FormValues) {
    mutation.mutate(
      {
        vendor: values.vendor,
        expectedDate: values.expectedDate || undefined,
        items: values.items.map((i) => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
      },
      { onSuccess: () => { onDone(); reset(); } }
    );
  }

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Create purchase order</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Vendor</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm"
              {...register("vendor", { required: true })}
            >
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Expected date (optional)</Label>
            <Input type="date" {...register("expectedDate")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Items</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_80px_100px_auto] gap-2">
              <Input placeholder="Description" {...register(`items.${index}.description`, { required: true })} />
              <Input type="number" min={1} placeholder="Qty" {...register(`items.${index}.quantity`, { valueAsNumber: true, required: true })} />
              <Input type="number" min={0} placeholder="Unit price" {...register(`items.${index}.unitPrice`, { valueAsNumber: true, required: true })} />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
          >
            <Plus className="size-4" /> Add line
          </Button>
        </div>

        <p className="text-right text-sm font-medium">Total: ₹{total.toLocaleString("en-IN")}</p>

        <DialogFooter>
          <Button type="submit" loading={mutation.isPending}>
            Create purchase order
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function PurchaseOrderPanel() {
  const { data: orders = [], isLoading } = usePurchaseOrders();
  const statusMutation = useUpdatePurchaseOrderStatus();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Purchase orders</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> New PO
            </Button>
          </DialogTrigger>
          <NewPurchaseOrderDialog onDone={() => setDialogOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Order date</TableHead>
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
            {!isLoading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No purchase orders yet.
                </TableCell>
              </TableRow>
            )}
            {orders.map((o) => (
              <TableRow key={o._id}>
                <TableCell className="font-mono text-xs">{o.poNumber}</TableCell>
                <TableCell className="font-medium">{o.vendor.name}</TableCell>
                <TableCell>{o.items.length} item(s)</TableCell>
                <TableCell>₹{o.totalAmount.toLocaleString("en-IN")}</TableCell>
                <TableCell>{formatDate(o.orderDate)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {o.status !== "received" && o.status !== "cancelled" && (
                    <Select
                      value=""
                      onValueChange={(v) => statusMutation.mutate({ id: o._id, status: v as PurchaseOrderStatus })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent>
                        {o.status === "draft" && <SelectItem value="sent">Mark sent</SelectItem>}
                        {o.status === "sent" && <SelectItem value="received">Mark received</SelectItem>}
                        <SelectItem value="cancelled">Cancel</SelectItem>
                      </SelectContent>
                    </Select>
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
