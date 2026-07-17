import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Income } from "@/models/Income";
import { Donation } from "@/models/Donation";
import { Expense } from "@/models/Expense";
import { Vendor } from "@/models/Vendor";
import { VendorPayment } from "@/models/VendorPayment";
import { Budget } from "@/models/Budget";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { generateDocumentNumber } from "@/lib/utils/document-number";
import type {
  CreateIncomeInput,
  CreateDonationInput,
  CreateExpenseInput,
  CreateVendorInput,
  UpdateVendorInput,
  CreateVendorPaymentInput,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@/validators/finance.validator";

// --- Income ---

export async function listIncome(school?: string, from?: string, to?: string) {
  await connectDB();
  if (!school) return [];
  return Income.find({
    school,
    ...(from || to
      ? { date: { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) } }
      : {}),
  })
    .sort({ date: -1 })
    .populate("recordedBy", "name")
    .lean();
}

export async function createIncome(input: CreateIncomeInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const income = await Income.create({
    ...input,
    date: new Date(input.date),
    source: input.source || undefined,
    school: actor.school,
    recordedBy: actor.id,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "income.create",
    entityType: "Income",
    entityId: income._id,
    school: actor.school,
  });

  return income;
}

// --- Donations ---

export async function listDonations(school?: string, from?: string, to?: string) {
  await connectDB();
  if (!school) return [];
  return Donation.find({
    school,
    ...(from || to
      ? { date: { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) } }
      : {}),
  })
    .sort({ date: -1 })
    .populate("receivedBy", "name")
    .lean();
}

export async function createDonation(input: CreateDonationInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const donation = await Donation.create({
    ...input,
    date: new Date(input.date),
    donorContact: input.donorContact || undefined,
    donorPan: input.donorPan || undefined,
    purpose: input.purpose || undefined,
    receiptNumber: generateDocumentNumber("DON"),
    school: actor.school,
    receivedBy: actor.id,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "donation.create",
    entityType: "Donation",
    entityId: donation._id,
    school: actor.school,
  });

  return donation;
}

// --- Expenses ---

export async function listExpenses(school?: string, from?: string, to?: string) {
  await connectDB();
  if (!school) return [];
  return Expense.find({
    school,
    ...(from || to
      ? { date: { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) } }
      : {}),
  })
    .sort({ date: -1 })
    .populate("vendor", "name")
    .populate("approvedBy", "name")
    .populate("recordedBy", "name")
    .lean();
}

export async function createExpense(input: CreateExpenseInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  if (input.vendor) {
    const vendor = await Vendor.findOne({ _id: input.vendor, school: actor.school });
    if (!vendor) throw ApiError.badRequest("Vendor not found");
  }

  const expense = await Expense.create({
    ...input,
    date: new Date(input.date),
    vendor: input.vendor || undefined,
    billReference: input.billReference || undefined,
    school: actor.school,
    approvedBy: actor.id,
    recordedBy: actor.id,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "expense.create",
    entityType: "Expense",
    entityId: expense._id,
    school: actor.school,
  });

  return expense;
}

// --- Vendors (shared with Inventory) ---

export async function listVendors(school?: string) {
  await connectDB();
  if (!school) return [];
  return Vendor.find({ school }).sort({ name: 1 }).lean();
}

export async function createVendor(input: CreateVendorInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await Vendor.findOne({ school: actor.school, name: input.name });
  if (existing) throw ApiError.conflict("A vendor with this name already exists");

  const vendor = await Vendor.create({
    ...input,
    contactPerson: input.contactPerson || undefined,
    email: input.email || undefined,
    address: input.address || undefined,
    gstNumber: input.gstNumber || undefined,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "vendor.create",
    entityType: "Vendor",
    entityId: vendor._id,
    school: actor.school,
  });

  return vendor;
}

export async function updateVendor(id: string, input: UpdateVendorInput, actor: { id: string; school?: string }) {
  await connectDB();

  const vendor = await Vendor.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!vendor) throw ApiError.notFound("Vendor not found");

  Object.assign(vendor, input);
  await vendor.save();

  await ActivityLog.create({
    user: actor.id,
    action: "vendor.update",
    entityType: "Vendor",
    entityId: vendor._id,
    school: actor.school,
  });

  return vendor;
}

export async function listVendorPayments(school?: string, vendorId?: string) {
  await connectDB();
  if (!school) return [];
  return VendorPayment.find({ school, ...(vendorId ? { vendor: vendorId } : {}) })
    .sort({ date: -1 })
    .populate("vendor", "name")
    .populate("approvedBy", "name")
    .lean();
}

export async function createVendorPayment(
  input: CreateVendorPaymentInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const vendor = await Vendor.findOne({ _id: input.vendor, school: actor.school });
  if (!vendor) throw ApiError.badRequest("Vendor not found");

  const payment = await VendorPayment.create({
    ...input,
    date: new Date(input.date),
    reference: input.reference || undefined,
    school: actor.school,
    approvedBy: actor.id,
    recordedBy: actor.id,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "vendor_payment.create",
    entityType: "VendorPayment",
    entityId: payment._id,
    school: actor.school,
  });

  return payment;
}

// --- Budget planning ---

export async function listBudgets(school?: string, academicYear?: string) {
  await connectDB();
  if (!school) return [];

  const budgets = await Budget.find({ school, ...(academicYear ? { academicYear } : {}) })
    .sort({ category: 1 })
    .populate("academicYear", "name")
    .lean();

  const spentByCategory = await Expense.aggregate([
    { $match: { school: new Types.ObjectId(school) } },
    { $group: { _id: "$category", spent: { $sum: "$amount" } } },
  ]);
  const spentMap = new Map(spentByCategory.map((s) => [s._id, s.spent as number]));

  return budgets.map((b) => ({
    ...b,
    spentAmount: spentMap.get(b.category) ?? 0,
  }));
}

export async function createBudget(input: CreateBudgetInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await Budget.findOne({
    school: actor.school,
    academicYear: input.academicYear,
    category: input.category,
  });
  if (existing) throw ApiError.conflict("A budget already exists for this category and year");

  const budget = await Budget.create({
    ...input,
    notes: input.notes || undefined,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "budget.create",
    entityType: "Budget",
    entityId: budget._id,
    school: actor.school,
  });

  return budget;
}

export async function updateBudget(id: string, input: UpdateBudgetInput, actor: { id: string; school?: string }) {
  await connectDB();

  const budget = await Budget.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!budget) throw ApiError.notFound("Budget not found");

  Object.assign(budget, input);
  await budget.save();

  await ActivityLog.create({
    user: actor.id,
    action: "budget.update",
    entityType: "Budget",
    entityId: budget._id,
    school: actor.school,
  });

  return budget;
}
