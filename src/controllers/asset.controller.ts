import { type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { AssetCategory } from "@/models/AssetCategory";
import { Asset, type IAsset } from "@/models/Asset";
import { AssetTransfer } from "@/models/AssetTransfer";
import { Vendor } from "@/models/Vendor";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type {
  CreateAssetCategoryInput,
  CreateAssetInput,
  UpdateAssetInput,
  AssetQueryInput,
  CreateAssetTransferInput,
} from "@/validators/inventory.validator";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/** Straight-line depreciation, computed on read (never stored — always current). */
export function computeCurrentValue(asset: Pick<IAsset, "purchaseCost" | "purchaseDate" | "depreciationRatePercent">) {
  const yearsElapsed = (Date.now() - asset.purchaseDate.getTime()) / MS_PER_YEAR;
  const depreciated = asset.purchaseCost * (1 - (asset.depreciationRatePercent / 100) * yearsElapsed);
  return Math.max(0, Math.round(depreciated * 100) / 100);
}

// --- Categories ---

export async function listAssetCategories(school?: string) {
  await connectDB();
  if (!school) return [];
  return AssetCategory.find({ school }).sort({ name: 1 }).lean();
}

export async function createAssetCategory(input: CreateAssetCategoryInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await AssetCategory.findOne({ school: actor.school, name: input.name });
  if (existing) throw ApiError.conflict("A category with this name already exists");

  const category = await AssetCategory.create({ ...input, school: actor.school });

  await ActivityLog.create({
    user: actor.id,
    action: "asset_category.create",
    entityType: "AssetCategory",
    entityId: category._id,
    school: actor.school,
  });

  return category;
}

// --- Assets ---

export async function listAssets(query: AssetQueryInput, school?: string) {
  await connectDB();
  if (!school) return { items: [], total: 0 };

  const filter: QueryFilter<IAsset> = { school };
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status as IAsset["status"];
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { tag: { $regex: query.search, $options: "i" } },
      { serialNumber: { $regex: query.search, $options: "i" } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Asset.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("category", "name type")
      .populate("vendor", "name")
      .lean(),
    Asset.countDocuments(filter),
  ]);

  return {
    items: items.map((a) => ({ ...a, currentValue: computeCurrentValue(a) })),
    total,
  };
}

export async function getAssetById(id: string, school?: string) {
  await connectDB();

  const asset = await Asset.findOne({ _id: id, ...(school ? { school } : {}) })
    .populate("category", "name type")
    .populate("vendor", "name")
    .lean();
  if (!asset) throw ApiError.notFound("Asset not found");

  const transfers = await AssetTransfer.find({ asset: id })
    .sort({ date: -1 })
    .populate("transferredBy", "name")
    .lean();

  return { asset: { ...asset, currentValue: computeCurrentValue(asset) }, transfers };
}

export async function createAsset(input: CreateAssetInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const category = await AssetCategory.findOne({ _id: input.category, school: actor.school });
  if (!category) throw ApiError.badRequest("Asset category not found");

  if (input.vendor) {
    const vendor = await Vendor.findOne({ _id: input.vendor, school: actor.school });
    if (!vendor) throw ApiError.badRequest("Vendor not found");
  }

  const existingTag = await Asset.findOne({ school: actor.school, tag: input.tag.toUpperCase() });
  if (existingTag) throw ApiError.conflict("An asset with this tag already exists");

  const asset = await Asset.create({
    ...input,
    purchaseDate: new Date(input.purchaseDate),
    warrantyExpiry: input.warrantyExpiry ? new Date(input.warrantyExpiry) : undefined,
    vendor: input.vendor || undefined,
    serialNumber: input.serialNumber || undefined,
    notes: input.notes || undefined,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "asset.create",
    entityType: "Asset",
    entityId: asset._id,
    school: actor.school,
  });

  return asset;
}

export async function updateAsset(id: string, input: UpdateAssetInput, actor: { id: string; school?: string }) {
  await connectDB();

  const asset = await Asset.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!asset) throw ApiError.notFound("Asset not found");

  const { purchaseDate, warrantyExpiry, ...rest } = input;
  Object.assign(asset, {
    ...rest,
    ...(purchaseDate ? { purchaseDate: new Date(purchaseDate) } : {}),
    ...(warrantyExpiry ? { warrantyExpiry: new Date(warrantyExpiry) } : {}),
    ...(input.tag ? { tag: input.tag.toUpperCase() } : {}),
  });
  await asset.save();

  await ActivityLog.create({
    user: actor.id,
    action: "asset.update",
    entityType: "Asset",
    entityId: asset._id,
    school: actor.school,
  });

  return asset;
}

export async function deleteAsset(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const asset = await Asset.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!asset) throw ApiError.notFound("Asset not found");

  await asset.deleteOne();
  await AssetTransfer.deleteMany({ asset: id });

  await ActivityLog.create({
    user: actor.id,
    action: "asset.delete",
    entityType: "Asset",
    entityId: id,
    school: actor.school,
  });
}

export async function transferAsset(input: CreateAssetTransferInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const asset = await Asset.findOne({ _id: input.asset, school: actor.school });
  if (!asset) throw ApiError.notFound("Asset not found");

  const transfer = await AssetTransfer.create({
    asset: asset._id,
    fromLocation: asset.location,
    toLocation: input.toLocation,
    transferredBy: actor.id,
    reason: input.reason || undefined,
    school: actor.school,
  });

  asset.location = input.toLocation;
  await asset.save();

  await ActivityLog.create({
    user: actor.id,
    action: "asset.transfer",
    entityType: "Asset",
    entityId: asset._id,
    metadata: { from: transfer.fromLocation, to: transfer.toLocation },
    school: actor.school,
  });

  return transfer;
}
