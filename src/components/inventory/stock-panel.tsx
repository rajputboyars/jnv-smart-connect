"use client";

import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import {
  useStockItems,
  useCreateStockItem,
  useStockTransactions,
  useRecordStockTransaction,
} from "@/hooks/use-inventory";
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
import type { StockUnit, StockTransactionType } from "@/models/enums";

function NewStockItemDialog({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState<StockUnit>("piece");
  const [reorderLevel, setReorderLevel] = useState("0");
  const mutation = useCreateStockItem();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add stock item</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="A4 Paper" />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Stationery" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as StockUnit)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="piece">Piece</SelectItem>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="packet">Packet</SelectItem>
                <SelectItem value="ream">Ream</SelectItem>
                <SelectItem value="litre">Litre</SelectItem>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="set">Set</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Reorder level</Label>
            <Input type="number" min={0} value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!name.trim() || !category.trim()}
          onClick={() =>
            mutation.mutate(
              { name, category, unit, reorderLevel: Number(reorderLevel) },
              { onSuccess: () => { onDone(); setName(""); setCategory(""); setReorderLevel("0"); } }
            )
          }
        >
          Add item
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function StockTransactionDialog({ onDone }: { onDone: () => void }) {
  const { data: items = [] } = useStockItems();
  const [stockItem, setStockItem] = useState("");
  const [type, setType] = useState<StockTransactionType>("purchase");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const mutation = useRecordStockTransaction();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Record stock movement</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Item</Label>
          <Select value={stockItem} onValueChange={setStockItem}>
            <SelectTrigger>
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
              {items.map((i) => (
                <SelectItem key={i._id} value={i._id}>
                  {i.name} ({i.quantityInStock} {i.unit} in stock)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as StockTransactionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase (stock in)</SelectItem>
                <SelectItem value="issue">Issue (stock out)</SelectItem>
                <SelectItem value="adjustment">Adjustment (set count)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{type === "adjustment" ? "New quantity" : "Quantity"}</Label>
            <Input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Reference (optional)</Label>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!stockItem || !quantity}
          onClick={() =>
            mutation.mutate(
              { stockItem, type, quantity: Number(quantity), reference },
              { onSuccess: () => { onDone(); setStockItem(""); setQuantity(""); setReference(""); } }
            )
          }
        >
          Record
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function StockPanel() {
  const { user } = useAuth();
  const canManage = !!user && can(user.role, PERMISSIONS.INVENTORY_MANAGE);

  const { data: items = [], isLoading } = useStockItems();
  const { data: transactions = [], isLoading: loadingTransactions } = useStockTransactions();
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Stock / consumables</CardTitle>
          {canManage && (
            <div className="flex gap-2">
              <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="size-4" /> Add item
                  </Button>
                </DialogTrigger>
                <NewStockItemDialog onDone={() => setItemDialogOpen(false)} />
              </Dialog>
              <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="size-4" /> Stock movement
                  </Button>
                </DialogTrigger>
                <StockTransactionDialog onDone={() => setTransactionDialogOpen(false)} />
              </Dialog>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>In stock</TableHead>
                <TableHead>Reorder level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No stock items yet.
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => {
                const low = item.quantityInStock <= item.reorderLevel;
                return (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.quantityInStock} {item.unit}
                    </TableCell>
                    <TableCell>{item.reorderLevel}</TableCell>
                    <TableCell>
                      {low ? (
                        <Badge variant="destructive">
                          <AlertTriangle className="size-3" /> Low stock
                        </Badge>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent stock movements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingTransactions && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {!loadingTransactions && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No stock movements yet.
                  </TableCell>
                </TableRow>
              )}
              {transactions.map((t) => (
                <TableRow key={t._id}>
                  <TableCell className="font-medium">{t.stockItem.name}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell>
                    {t.quantity} {t.stockItem.unit}
                  </TableCell>
                  <TableCell>{formatDate(t.date)}</TableCell>
                  <TableCell>{t.performedBy.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
