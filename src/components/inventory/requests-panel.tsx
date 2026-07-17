"use client";

import { useState } from "react";
import { Plus, Check, X, PackageCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { useInventoryRequests, useCreateInventoryRequest, useReviewInventoryRequest } from "@/hooks/use-inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { InventoryRequestStatus } from "@/models/enums";

function statusVariant(status: InventoryRequestStatus): "success" | "warning" | "destructive" | "outline" {
  if (status === "fulfilled") return "success";
  if (status === "approved") return "warning";
  if (status === "rejected") return "destructive";
  return "outline";
}

function NewRequestDialog({ onDone }: { onDone: () => void }) {
  const [itemDescription, setItemDescription] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [purpose, setPurpose] = useState("");
  const mutation = useCreateInventoryRequest();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Request an item</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Item description</Label>
          <Input value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Whiteboard markers" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category (optional)</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Purpose</Label>
          <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!itemDescription.trim() || !purpose.trim()}
          onClick={() =>
            mutation.mutate(
              { itemDescription, category, quantity: Number(quantity), purpose },
              { onSuccess: () => { onDone(); setItemDescription(""); setCategory(""); setQuantity("1"); setPurpose(""); } }
            )
          }
        >
          Submit request
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function RequestsPanel() {
  const { user } = useAuth();
  const canManage = !!user && can(user.role, PERMISSIONS.INVENTORY_MANAGE);
  const { data: requests = [], isLoading } = useInventoryRequests();
  const reviewMutation = useReviewInventoryRequest();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{canManage ? "Inventory requests" : "My requests"}</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> New request
            </Button>
          </DialogTrigger>
          <NewRequestDialog onDone={() => setDialogOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Requested by</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={canManage ? 6 : 5}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 6 : 5} className="py-10 text-center text-muted-foreground">
                  No requests yet.
                </TableCell>
              </TableRow>
            )}
            {requests.map((r) => (
              <TableRow key={r._id}>
                <TableCell className="font-medium">
                  {r.itemDescription}
                  <div className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
                </TableCell>
                <TableCell>{r.quantity}</TableCell>
                <TableCell className="max-w-xs truncate">{r.purpose}</TableCell>
                <TableCell>{r.requestedBy.name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                </TableCell>
                {canManage && (
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
                        onClick={() => reviewMutation.mutate({ id: r._id, status: "fulfilled" })}
                      >
                        <PackageCheck className="size-4" /> Fulfilled
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
