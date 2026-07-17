import { z } from "zod";
import {
  ASSET_CATEGORY_TYPES,
  ASSET_CONDITIONS,
  ASSET_STATUSES,
  STOCK_UNITS,
  STOCK_TRANSACTION_TYPES,
  INVENTORY_REQUEST_STATUSES,
  PURCHASE_ORDER_STATUSES,
} from "@/models/enums";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createAssetCategorySchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  type: z.enum(ASSET_CATEGORY_TYPES),
});
export type CreateAssetCategoryInput = z.infer<typeof createAssetCategorySchema>;

export const createAssetSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  category: objectId,
  tag: z.string().trim().min(1, "Asset tag is required"),
  serialNumber: z.string().trim().max(100).optional().or(z.literal("")),
  location: z.string().trim().min(1, "Location is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchaseCost: z.number().min(0),
  vendor: objectId.optional().or(z.literal("")),
  condition: z.enum(ASSET_CONDITIONS),
  depreciationRatePercent: z.number().min(0).max(100),
  warrantyExpiry: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CreateAssetInput = z.infer<typeof createAssetSchema>;

export const updateAssetSchema = createAssetSchema.partial().extend({
  status: z.enum(ASSET_STATUSES).optional(),
});
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

export const assetQuerySchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  category: objectId.optional().or(z.literal("")),
  status: z.string().optional(),
  search: z.string().trim().optional(),
});
export type AssetQueryInput = z.infer<typeof assetQuerySchema>;

export const createAssetTransferSchema = z.object({
  asset: objectId,
  toLocation: z.string().trim().min(1, "Destination is required"),
  reason: z.string().trim().max(300).optional().or(z.literal("")),
});
export type CreateAssetTransferInput = z.infer<typeof createAssetTransferSchema>;

export const createStockItemSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  category: z.string().trim().min(2, "Category is required"),
  unit: z.enum(STOCK_UNITS),
  reorderLevel: z.number().min(0),
});
export type CreateStockItemInput = z.infer<typeof createStockItemSchema>;
export const updateStockItemSchema = createStockItemSchema.partial();
export type UpdateStockItemInput = z.infer<typeof updateStockItemSchema>;

export const createStockTransactionSchema = z.object({
  stockItem: objectId,
  type: z.enum(STOCK_TRANSACTION_TYPES),
  quantity: z.number().min(0.01),
  reference: z.string().trim().max(200).optional().or(z.literal("")),
});
export type CreateStockTransactionInput = z.infer<typeof createStockTransactionSchema>;

export const createInventoryRequestSchema = z.object({
  itemDescription: z.string().trim().min(3, "Item description is required").max(300),
  category: z.string().trim().max(100).optional().or(z.literal("")),
  quantity: z.number().min(1),
  purpose: z.string().trim().min(3, "Purpose is required").max(300),
});
export type CreateInventoryRequestInput = z.infer<typeof createInventoryRequestSchema>;

export const reviewInventoryRequestSchema = z.object({
  status: z.enum(INVENTORY_REQUEST_STATUSES),
  reviewNote: z.string().trim().max(500).optional().or(z.literal("")),
});
export type ReviewInventoryRequestInput = z.infer<typeof reviewInventoryRequestSchema>;

const purchaseOrderItemSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

export const createPurchaseOrderSchema = z.object({
  vendor: objectId,
  items: z.array(purchaseOrderItemSchema).min(1, "At least one item is required"),
  expectedDate: z.string().optional().or(z.literal("")),
});
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(PURCHASE_ORDER_STATUSES),
});
export type UpdatePurchaseOrderStatusInput = z.infer<typeof updatePurchaseOrderStatusSchema>;
