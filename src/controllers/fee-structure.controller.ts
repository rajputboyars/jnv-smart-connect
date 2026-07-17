import { type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { FeeCategory, type IFeeCategory } from "@/models/FeeCategory";
import { FeeStructure, type IFeeStructure } from "@/models/FeeStructure";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type {
  CreateFeeCategoryInput,
  UpdateFeeCategoryInput,
  CreateFeeStructureInput,
  UpdateFeeStructureInput,
} from "@/validators/finance.validator";

// --- Fee categories ---

export async function listFeeCategories(school?: string) {
  await connectDB();
  if (!school) return [];
  return FeeCategory.find({ school }).sort({ name: 1 }).lean();
}

export async function createFeeCategory(
  input: CreateFeeCategoryInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await FeeCategory.findOne({ school: actor.school, code: input.code.toUpperCase() });
  if (existing) throw ApiError.conflict("A fee category with this code already exists");

  const category = await FeeCategory.create({
    ...input,
    description: input.description || undefined,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "fee_category.create",
    entityType: "FeeCategory",
    entityId: category._id,
    school: actor.school,
  });

  return category;
}

export async function updateFeeCategory(
  id: string,
  input: UpdateFeeCategoryInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const category = await FeeCategory.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!category) throw ApiError.notFound("Fee category not found");

  Object.assign(category, {
    ...input,
    ...(input.code ? { code: input.code.toUpperCase() } : {}),
  });
  await category.save();

  await ActivityLog.create({
    user: actor.id,
    action: "fee_category.update",
    entityType: "FeeCategory",
    entityId: category._id,
    school: actor.school,
  });

  return category;
}

export async function deleteFeeCategory(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const category = await FeeCategory.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!category) throw ApiError.notFound("Fee category not found");

  const inUse = await FeeStructure.countDocuments({ feeCategory: id });
  if (inUse > 0) throw ApiError.conflict("Remove all fee structures using this category first");

  await category.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "fee_category.delete",
    entityType: "FeeCategory",
    entityId: id,
    school: actor.school,
  });
}

// --- Fee structures ---

export async function listFeeStructures(school?: string, academicYear?: string) {
  await connectDB();
  if (!school) return [];

  const filter: QueryFilter<IFeeStructure> = {
    school,
    ...(academicYear ? { academicYear } : {}),
  };

  return FeeStructure.find(filter)
    .sort({ createdAt: -1 })
    .populate("class", "name")
    .populate("feeCategory", "name code frequency")
    .populate("academicYear", "name")
    .lean();
}

export async function createFeeStructure(
  input: CreateFeeStructureInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const category = await FeeCategory.findOne({ _id: input.feeCategory, school: actor.school });
  if (!category) throw ApiError.badRequest("Fee category not found");

  const existing = await FeeStructure.findOne({
    school: actor.school,
    academicYear: input.academicYear,
    class: input.class,
    feeCategory: input.feeCategory,
  });
  if (existing) throw ApiError.conflict("A fee structure already exists for this class/category/year");

  const structure = await FeeStructure.create({
    ...input,
    dueDate: new Date(input.dueDate),
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "fee_structure.create",
    entityType: "FeeStructure",
    entityId: structure._id,
    school: actor.school,
  });

  return structure;
}

export async function updateFeeStructure(
  id: string,
  input: UpdateFeeStructureInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const structure = await FeeStructure.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!structure) throw ApiError.notFound("Fee structure not found");

  const { dueDate, ...rest } = input;
  Object.assign(structure, { ...rest, ...(dueDate ? { dueDate: new Date(dueDate) } : {}) });
  await structure.save();

  await ActivityLog.create({
    user: actor.id,
    action: "fee_structure.update",
    entityType: "FeeStructure",
    entityId: structure._id,
    school: actor.school,
  });

  return structure;
}

export async function deleteFeeStructure(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const structure = await FeeStructure.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!structure) throw ApiError.notFound("Fee structure not found");

  const { FeeInvoice } = await import("@/models/FeeInvoice");
  const invoiced = await FeeInvoice.countDocuments({ feeStructure: id });
  if (invoiced > 0) throw ApiError.conflict("Invoices have already been generated for this fee structure");

  await structure.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "fee_structure.delete",
    entityType: "FeeStructure",
    entityId: id,
    school: actor.school,
  });
}

export type { IFeeCategory };
