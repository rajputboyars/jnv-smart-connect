"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as svc from "@/services/inventory.service";
import { ApiClientError } from "@/lib/api-client";
import type { InventoryRequestStatus, PurchaseOrderStatus } from "@/models/enums";

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

// --- Categories ---

export function useAssetCategories() {
  return useQuery({ queryKey: ["inventory", "categories"], queryFn: svc.fetchAssetCategories });
}
export function useCreateAssetCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createAssetCategoryRequest,
    onSuccess: () => {
      toast.success("Category created");
      qc.invalidateQueries({ queryKey: ["inventory", "categories"] });
    },
    onError: handleError,
  });
}

// --- Assets ---

export function useAssets(params: svc.AssetListParams) {
  return useQuery({
    queryKey: ["inventory", "assets", params],
    queryFn: () => svc.fetchAssets(params),
    placeholderData: (prev) => prev,
  });
}
export function useAsset(id: string) {
  return useQuery({ queryKey: ["inventory", "asset", id], queryFn: () => svc.fetchAssetById(id), enabled: !!id });
}
export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createAssetRequest,
    onSuccess: () => {
      toast.success("Asset added");
      qc.invalidateQueries({ queryKey: ["inventory", "assets"] });
    },
    onError: handleError,
  });
}
export function useUpdateAsset(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof svc.updateAssetRequest>[1]) => svc.updateAssetRequest(id, input),
    onSuccess: () => {
      toast.success("Asset updated");
      qc.invalidateQueries({ queryKey: ["inventory", "assets"] });
      qc.invalidateQueries({ queryKey: ["inventory", "asset", id] });
    },
    onError: handleError,
  });
}
export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.deleteAssetRequest,
    onSuccess: () => {
      toast.success("Asset removed");
      qc.invalidateQueries({ queryKey: ["inventory", "assets"] });
    },
    onError: handleError,
  });
}
export function useTransferAsset(assetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof svc.transferAssetRequest>[1]) => svc.transferAssetRequest(assetId, input),
    onSuccess: () => {
      toast.success("Asset transferred");
      qc.invalidateQueries({ queryKey: ["inventory", "asset", assetId] });
      qc.invalidateQueries({ queryKey: ["inventory", "assets"] });
    },
    onError: handleError,
  });
}

// --- Stock ---

export function useStockItems() {
  return useQuery({ queryKey: ["inventory", "stock-items"], queryFn: svc.fetchStockItems });
}
export function useCreateStockItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createStockItemRequest,
    onSuccess: () => {
      toast.success("Stock item added");
      qc.invalidateQueries({ queryKey: ["inventory", "stock-items"] });
    },
    onError: handleError,
  });
}
export function useStockTransactions(stockItemId?: string) {
  return useQuery({
    queryKey: ["inventory", "stock-transactions", stockItemId],
    queryFn: () => svc.fetchStockTransactions(stockItemId),
  });
}
export function useRecordStockTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createStockTransactionRequest,
    onSuccess: (res) => {
      toast.success(`Recorded. Current stock: ${res.data?.currentStock}`);
      qc.invalidateQueries({ queryKey: ["inventory", "stock-items"] });
      qc.invalidateQueries({ queryKey: ["inventory", "stock-transactions"] });
    },
    onError: handleError,
  });
}

// --- Inventory requests ---

export function useInventoryRequests(status?: string) {
  return useQuery({ queryKey: ["inventory", "requests", status], queryFn: () => svc.fetchInventoryRequests(status) });
}
export function useCreateInventoryRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createInventoryRequestRequest,
    onSuccess: () => {
      toast.success("Request submitted");
      qc.invalidateQueries({ queryKey: ["inventory", "requests"] });
    },
    onError: handleError,
  });
}
export function useReviewInventoryRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reviewNote }: { id: string; status: InventoryRequestStatus; reviewNote?: string }) =>
      svc.reviewInventoryRequestRequest(id, { status, reviewNote }),
    onSuccess: () => {
      toast.success("Request updated");
      qc.invalidateQueries({ queryKey: ["inventory", "requests"] });
    },
    onError: handleError,
  });
}

// --- Purchase orders ---

export function usePurchaseOrders(status?: string) {
  return useQuery({ queryKey: ["inventory", "purchase-orders", status], queryFn: () => svc.fetchPurchaseOrders(status) });
}
export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createPurchaseOrderRequest,
    onSuccess: () => {
      toast.success("Purchase order created");
      qc.invalidateQueries({ queryKey: ["inventory", "purchase-orders"] });
    },
    onError: handleError,
  });
}
export function useUpdatePurchaseOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PurchaseOrderStatus }) =>
      svc.updatePurchaseOrderStatusRequest(id, status),
    onSuccess: () => {
      toast.success("Purchase order updated");
      qc.invalidateQueries({ queryKey: ["inventory", "purchase-orders"] });
    },
    onError: handleError,
  });
}
