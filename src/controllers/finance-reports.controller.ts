import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { FeePayment } from "@/models/FeePayment";
import { Income } from "@/models/Income";
import { Donation } from "@/models/Donation";
import { Expense } from "@/models/Expense";
import { VendorPayment } from "@/models/VendorPayment";
import { Refund } from "@/models/Refund";

export type LedgerEntryType = "fee_payment" | "income" | "donation" | "expense" | "vendor_payment" | "refund";

export interface LedgerEntry {
  date: Date;
  type: LedgerEntryType;
  direction: "credit" | "debit";
  description: string;
  method: string;
  amount: number;
}

interface DateRange {
  from?: string;
  to?: string;
}

function dateMatch(range: DateRange, field = "date") {
  if (!range.from && !range.to) return {};
  return {
    [field]: {
      ...(range.from ? { $gte: new Date(range.from) } : {}),
      ...(range.to ? { $lte: new Date(range.to) } : {}),
    },
  };
}

/**
 * Builds a unified, chronological transaction feed across every money-moving
 * collection in the app. `cashOnly` powers the Cash Book (cash-method
 * transactions only); without it, this is the General Ledger.
 */
async function buildLedger(school: string, range: DateRange, cashOnly: boolean): Promise<LedgerEntry[]> {
  await connectDB();
  const schoolId = new Types.ObjectId(school);
  const methodFilter = cashOnly ? ({ method: "cash" } as const) : {};
  const paymentMethodFilter = cashOnly ? ({ paymentMethod: "cash" } as const) : {};

  const [feePayments, income, donations, expenses, vendorPayments, refunds] = await Promise.all([
    FeePayment.find({ school: schoolId, ...methodFilter, ...dateMatch(range, "paidAt") })
      .populate("student", "name admissionNumber")
      .lean(),
    Income.find({ school: schoolId, ...dateMatch(range) }).lean(),
    Donation.find({ school: schoolId, ...dateMatch(range) }).lean(),
    Expense.find({ school: schoolId, ...paymentMethodFilter, ...dateMatch(range) }).lean(),
    VendorPayment.find({ school: schoolId, ...paymentMethodFilter, ...dateMatch(range) }).populate(
      "vendor",
      "name"
    ),
    Refund.find({ school: schoolId, status: "processed", ...dateMatch(range, "processedAt") })
      .populate("student", "name admissionNumber")
      .lean(),
  ]);

  const entries: LedgerEntry[] = [
    ...feePayments.map((p) => ({
      date: p.paidAt,
      type: "fee_payment" as const,
      direction: "credit" as const,
      description: `Fee payment — ${(p.student as unknown as { name?: string })?.name ?? "Student"} (${p.receiptNumber})`,
      method: p.method,
      amount: p.amount,
    })),
    ...income.map((i) => ({
      date: i.date,
      type: "income" as const,
      direction: "credit" as const,
      description: `${i.category} — ${i.description}`,
      method: "—",
      amount: i.amount,
    })),
    ...donations.map((d) => ({
      date: d.date,
      type: "donation" as const,
      direction: "credit" as const,
      description: `Donation from ${d.donorName}${d.purpose ? ` — ${d.purpose}` : ""}`,
      method: "—",
      amount: d.amount,
    })),
    ...expenses.map((e) => ({
      date: e.date,
      type: "expense" as const,
      direction: "debit" as const,
      description: `${e.category} — ${e.description}`,
      method: e.paymentMethod,
      amount: e.amount,
    })),
    ...vendorPayments.map((v) => ({
      date: v.date,
      type: "vendor_payment" as const,
      direction: "debit" as const,
      description: `Vendor payment — ${(v.vendor as unknown as { name?: string })?.name ?? "Vendor"} (${v.purpose})`,
      method: v.paymentMethod,
      amount: v.amount,
    })),
    ...refunds.map((r) => ({
      date: r.processedAt as Date,
      type: "refund" as const,
      direction: "debit" as const,
      description: `Fee refund — ${(r.student as unknown as { name?: string })?.name ?? "Student"}`,
      method: "—",
      amount: r.amount,
    })),
  ];

  return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getCashBook(school: string, range: DateRange) {
  const entries = await buildLedger(school, range, true);
  let balance = 0;
  const rows = entries.map((e) => {
    balance += e.direction === "credit" ? e.amount : -e.amount;
    return { ...e, balance: Math.round(balance * 100) / 100 };
  });
  return { entries: rows, closingBalance: Math.round(balance * 100) / 100 };
}

export async function getGeneralLedger(school: string, range: DateRange) {
  const entries = await buildLedger(school, range, false);
  let balance = 0;
  const rows = entries.map((e) => {
    balance += e.direction === "credit" ? e.amount : -e.amount;
    return { ...e, balance: Math.round(balance * 100) / 100 };
  });
  return { entries: rows, closingBalance: Math.round(balance * 100) / 100 };
}

/** Same shape as the General Ledger — the "Audit Report" is the ledger with every transaction visible for external review, one date range at a time. */
export async function getAuditReport(school: string, range: DateRange) {
  return getGeneralLedger(school, range);
}

export async function getMonthlyIncomeReport(school: string, year: number) {
  await connectDB();
  const schoolId = new Types.ObjectId(school);
  const from = new Date(Date.UTC(year, 0, 1));
  const to = new Date(Date.UTC(year + 1, 0, 1));

  const [feeByMonth, incomeByMonth, donationByMonth] = await Promise.all([
    FeePayment.aggregate([
      { $match: { school: schoolId, paidAt: { $gte: from, $lt: to } } },
      { $group: { _id: { $month: "$paidAt" }, total: { $sum: "$amount" } } },
    ]),
    Income.aggregate([
      { $match: { school: schoolId, date: { $gte: from, $lt: to } } },
      { $group: { _id: { $month: "$date" }, total: { $sum: "$amount" } } },
    ]),
    Donation.aggregate([
      { $match: { school: schoolId, date: { $gte: from, $lt: to } } },
      { $group: { _id: { $month: "$date" }, total: { $sum: "$amount" } } },
    ]),
  ]);

  const feeMap = new Map(feeByMonth.map((m) => [m._id, m.total as number]));
  const incomeMap = new Map(incomeByMonth.map((m) => [m._id, m.total as number]));
  const donationMap = new Map(donationByMonth.map((m) => [m._id, m.total as number]));

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const feeCollection = feeMap.get(month) ?? 0;
    const otherIncome = incomeMap.get(month) ?? 0;
    const donations = donationMap.get(month) ?? 0;
    return {
      month,
      feeCollection,
      otherIncome,
      donations,
      total: feeCollection + otherIncome + donations,
    };
  });
}

export async function getAnnualReport(school: string, academicYearId: string) {
  await connectDB();
  const schoolId = new Types.ObjectId(school);

  const { AcademicYear } = await import("@/models/AcademicYear");
  const year = await AcademicYear.findById(academicYearId).lean();
  if (!year) {
    return null;
  }

  const range = { from: year.startDate.toISOString(), to: year.endDate.toISOString() };

  const [feeCollection, otherIncome, donations, expenses, vendorPayments, waivers, refunds] = await Promise.all([
    FeePayment.aggregate([
      { $match: { school: schoolId, ...dateMatch(range, "paidAt") } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Income.aggregate([
      { $match: { school: schoolId, ...dateMatch(range) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Donation.aggregate([
      { $match: { school: schoolId, ...dateMatch(range) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { school: schoolId, ...dateMatch(range) } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]),
    VendorPayment.aggregate([
      { $match: { school: schoolId, ...dateMatch(range) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    (await import("@/models/FeeWaiver")).FeeWaiver.aggregate([
      { $match: { school: schoolId, ...dateMatch(range, "createdAt") } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Refund.aggregate([
      { $match: { school: schoolId, status: "processed", ...dateMatch(range, "processedAt") } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const sum = (rows: { total: number }[]) => rows[0]?.total ?? 0;
  const totalExpenses = expenses.reduce((s, e) => s + e.total, 0) + sum(vendorPayments);

  return {
    academicYear: { id: year._id.toString(), name: year.name },
    income: {
      feeCollection: sum(feeCollection),
      otherIncome: sum(otherIncome),
      donations: sum(donations),
      total: sum(feeCollection) + sum(otherIncome) + sum(donations),
    },
    expenses: {
      byCategory: expenses.map((e) => ({ category: e._id as string, total: e.total as number })),
      vendorPayments: sum(vendorPayments),
      total: totalExpenses,
    },
    concessions: {
      waivers: sum(waivers),
      refunds: sum(refunds),
    },
    netSurplus:
      sum(feeCollection) + sum(otherIncome) + sum(donations) - totalExpenses - sum(refunds),
  };
}
