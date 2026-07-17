import { apiFetch } from "@/lib/api-client";
import type {
  AssetCategoryType,
  AssetCondition,
  AssetStatus,
  StockUnit,
  StockTransactionType,
  InventoryRequestStatus,
  PurchaseOrderStatus,
} from "@/models/enums";

// --- Categories ---

export interface AssetCategoryItem {
  _id: string;
  name: string;
  type: AssetCategoryType;
}
export async function fetchAssetCategories() {
  const res = await apiFetch<AssetCategoryItem[]>("/api/inventory/categories");
  return res.data ?? [];
}
export async function createAssetCategoryRequest(input: { name: string; type: AssetCategoryType }) {
  return apiFetch<{ id: string }>("/api/inventory/categories", { method: "POST", body: JSON.stringify(input) });
}

// --- Assets ---

export interface AssetItem {
  _id: string;
  name: string;
  category: { _id: string; name: string; type: AssetCategoryType };
  tag: string;
  serialNumber?: string;
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  vendor?: { _id: string; name: string };
  condition: AssetCondition;
  status: AssetStatus;
  depreciationRatePercent: number;
  warrantyExpiry?: string;
  currentValue: number;
}

export interface AssetInput {
  name: string;
  category: string;
  tag: string;
  serialNumber?: string;
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  vendor?: string;
  condition: AssetCondition;
  depreciationRatePercent: number;
  warrantyExpiry?: string;
  notes?: string;
}

export interface AssetListParams {
  page: number;
  limit: number;
  category?: string;
  status?: string;
  search?: string;
}

export async function fetchAssets(params: AssetListParams) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, String(value));
  });
  const res = await apiFetch<AssetItem[]>(`/api/inventory/assets?${searchParams.toString()}`);
  return { items: res.data ?? [], pagination: res.pagination! };
}

export async function createAssetRequest(input: AssetInput) {
  return apiFetch<{ id: string }>("/api/inventory/assets", { method: "POST", body: JSON.stringify(input) });
}
export async function updateAssetRequest(id: string, input: Partial<AssetInput & { status: AssetStatus }>) {
  return apiFetch<{ id: string }>(`/api/inventory/assets/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
export async function deleteAssetRequest(id: string) {
  await apiFetch(`/api/inventory/assets/${id}`, { method: "DELETE" });
}

export interface AssetTransferItem {
  _id: string;
  fromLocation: string;
  toLocation: string;
  transferredBy: { name: string };
  date: string;
  reason?: string;
}
export async function fetchAssetById(id: string) {
  const res = await apiFetch<{ asset: AssetItem; transfers: AssetTransferItem[] }>(`/api/inventory/assets/${id}`);
  return res.data!;
}
export async function transferAssetRequest(assetId: string, input: { toLocation: string; reason?: string }) {
  return apiFetch<{ id: string }>(`/api/inventory/assets/${assetId}/transfer`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// --- Stock ---

export interface StockItemDto {
  _id: string;
  name: string;
  category: string;
  unit: StockUnit;
  quantityInStock: number;
  reorderLevel: number;
}
export async function fetchStockItems() {
  const res = await apiFetch<StockItemDto[]>("/api/inventory/stock-items");
  return res.data ?? [];
}
export async function createStockItemRequest(input: {
  name: string;
  category: string;
  unit: StockUnit;
  reorderLevel: number;
}) {
  return apiFetch<{ id: string }>("/api/inventory/stock-items", { method: "POST", body: JSON.stringify(input) });
}

export interface StockTransactionDto {
  _id: string;
  stockItem: { _id: string; name: string; unit: StockUnit };
  type: StockTransactionType;
  quantity: number;
  date: string;
  performedBy: { name: string };
  reference?: string;
}
export async function fetchStockTransactions(stockItemId?: string) {
  const params = stockItemId ? `?stockItemId=${stockItemId}` : "";
  const res = await apiFetch<StockTransactionDto[]>(`/api/inventory/stock-transactions${params}`);
  return res.data ?? [];
}
export async function createStockTransactionRequest(input: {
  stockItem: string;
  type: StockTransactionType;
  quantity: number;
  reference?: string;
}) {
  return apiFetch<{ id: string; currentStock: number }>("/api/inventory/stock-transactions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// --- Inventory requests ---

export interface InventoryRequestItem {
  _id: string;
  itemDescription: string;
  category?: string;
  quantity: number;
  purpose: string;
  status: InventoryRequestStatus;
  requestedBy: { name: string };
  approvedBy?: { name: string };
  reviewNote?: string;
  createdAt: string;
}
export async function fetchInventoryRequests(status?: string) {
  const params = status ? `?status=${status}` : "";
  const res = await apiFetch<InventoryRequestItem[]>(`/api/inventory/requests${params}`);
  return res.data ?? [];
}
export async function createInventoryRequestRequest(input: {
  itemDescription: string;
  category?: string;
  quantity: number;
  purpose: string;
}) {
  return apiFetch<{ id: string }>("/api/inventory/requests", { method: "POST", body: JSON.stringify(input) });
}
export async function reviewInventoryRequestRequest(
  id: string,
  input: { status: InventoryRequestStatus; reviewNote?: string }
) {
  return apiFetch<{ id: string; status: InventoryRequestStatus }>(`/api/inventory/requests/${id}/review`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// --- Purchase orders ---

export interface PurchaseOrderItem {
  _id: string;
  poNumber: string;
  vendor: { _id: string; name: string };
  items: { description: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDate?: string;
  createdBy: { name: string };
}
export async function fetchPurchaseOrders(status?: string) {
  const params = status ? `?status=${status}` : "";
  const res = await apiFetch<PurchaseOrderItem[]>(`/api/inventory/purchase-orders${params}`);
  return res.data ?? [];
}
export async function createPurchaseOrderRequest(input: {
  vendor: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  expectedDate?: string;
}) {
  return apiFetch<{ id: string; poNumber: string }>("/api/inventory/purchase-orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export async function updatePurchaseOrderStatusRequest(id: string, status: PurchaseOrderStatus) {
  return apiFetch<{ id: string; status: PurchaseOrderStatus }>(`/api/inventory/purchase-orders/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}
