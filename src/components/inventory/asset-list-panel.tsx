"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Tag, ArrowRightLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import {
  useAssets,
  useAssetCategories,
  useCreateAssetCategory,
  useDeleteAsset,
  useTransferAsset,
} from "@/hooks/use-inventory";
import type { AssetItem } from "@/services/inventory.service";
import { Barcode } from "@/components/library/barcode";
import { AssetQr } from "@/components/inventory/asset-qr";
import { AssetFormDialog } from "@/components/inventory/asset-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
import type { AssetCategoryType } from "@/models/enums";

function statusVariant(status: string): "success" | "warning" | "destructive" | "outline" {
  if (status === "in_use") return "success";
  if (status === "under_repair") return "warning";
  if (status === "disposed") return "destructive";
  return "outline";
}

function NewCategoryDialog({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetCategoryType>("furniture");
  const mutation = useCreateAssetCategory();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add asset category</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sports Equipment" />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as AssetCategoryType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="computer_lab">Computer Lab</SelectItem>
              <SelectItem value="science_lab">Science Lab</SelectItem>
              <SelectItem value="library">Library</SelectItem>
              <SelectItem value="hostel">Hostel</SelectItem>
              <SelectItem value="classroom">Classroom</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!name.trim()}
          onClick={() =>
            mutation.mutate(
              { name, type },
              { onSuccess: () => { onDone(); setName(""); } }
            )
          }
        >
          Add category
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function TransferDialog({ asset, onDone }: { asset: AssetItem; onDone: () => void }) {
  const [toLocation, setToLocation] = useState("");
  const [reason, setReason] = useState("");
  const mutation = useTransferAsset(asset._id);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Transfer {asset.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Current location: {asset.location}</p>
        <div className="space-y-1.5">
          <Label>New location</Label>
          <Input value={toLocation} onChange={(e) => setToLocation(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Reason (optional)</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!toLocation.trim()}
          onClick={() =>
            mutation.mutate({ toLocation, reason }, { onSuccess: () => { onDone(); setToLocation(""); setReason(""); } })
          }
        >
          Transfer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function AssetListPanel() {
  const { user } = useAuth();
  const canManage = !!user && can(user.role, PERMISSIONS.INVENTORY_MANAGE);

  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const { data: categories = [] } = useAssetCategories();
  const { data, isLoading } = useAssets({
    page,
    limit: 15,
    category: category === "all" ? undefined : category,
    status: status === "all" ? undefined : status,
    search: search || undefined,
  });
  const deleteMutation = useDeleteAsset();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AssetItem | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [labelAsset, setLabelAsset] = useState<AssetItem | null>(null);
  const [transferAsset, setTransferAsset] = useState<AssetItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, tag, serial no."
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="in_use">In use</SelectItem>
              <SelectItem value="in_store">In store</SelectItem>
              <SelectItem value="under_repair">Under repair</SelectItem>
              <SelectItem value="disposed">Disposed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="size-4" /> Category
                </Button>
              </DialogTrigger>
              <NewCategoryDialog onDone={() => setCategoryDialogOpen(false)} />
            </Dialog>
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="size-4" /> Add asset
            </Button>
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current value</TableHead>
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
                No assets found.
              </TableCell>
            </TableRow>
          )}
          {data?.items.map((asset) => (
            <TableRow key={asset._id}>
              <TableCell className="font-medium">
                {asset.name}
                <span className="ml-2 text-xs text-muted-foreground">{asset.tag}</span>
              </TableCell>
              <TableCell>{asset.category.name}</TableCell>
              <TableCell>{asset.location}</TableCell>
              <TableCell className="capitalize">{asset.condition}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(asset.status)}>{asset.status.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell>₹{asset.currentValue.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setLabelAsset(asset)}>
                    <Tag className="size-4" />
                  </Button>
                  {canManage && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => setTransferAsset(asset)}>
                        <ArrowRightLeft className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(asset); setFormOpen(true); }}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(asset._id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
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

      {canManage && <AssetFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />}

      <Dialog open={!!labelAsset} onOpenChange={(open) => !open && setLabelAsset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labelAsset?.name}</DialogTitle>
          </DialogHeader>
          {labelAsset && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <Barcode value={labelAsset.tag} />
                <p className="text-xs text-muted-foreground">Barcode</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AssetQr value={labelAsset.tag} size={120} />
                <p className="text-xs text-muted-foreground">QR code</p>
              </div>
              <p className="col-span-2 text-center text-sm text-muted-foreground">Asset tag: {labelAsset.tag}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!transferAsset} onOpenChange={(open) => !open && setTransferAsset(null)}>
        {transferAsset && <TransferDialog asset={transferAsset} onDone={() => setTransferAsset(null)} />}
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove asset?"
        description="This will permanently remove the asset and its transfer history."
        confirmLabel="Remove"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
      />
    </div>
  );
}
