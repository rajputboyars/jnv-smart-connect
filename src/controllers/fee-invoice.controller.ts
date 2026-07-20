import { Types, type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { FeeStructure } from "@/models/FeeStructure";
import { FeeInvoice, type IFeeInvoice } from "@/models/FeeInvoice";
import { FeePayment } from "@/models/FeePayment";
import { FeeWaiver } from "@/models/FeeWaiver";
import { Refund } from "@/models/Refund";
import { Student } from "@/models/Student";
import { StudentScholarship } from "@/models/StudentScholarship";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { assertCanAccessStudent } from "@/lib/auth/student-scope";
import { generateDocumentNumber, splitAmount } from "@/lib/utils/document-number";
import { ROLES } from "@/types/roles";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type {
  RecordPaymentInput,
  CreateFeeWaiverInput,
  CreateRefundInput,
  ReviewRefundInput,
  InvoiceQueryInput,
} from "@/validators/finance.validator";

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)));
}

/** Recomputes and persists the late fee for an overdue, unpaid invoice. */
async function recalculateLateFee(invoice: InstanceType<typeof FeeInvoice>) {
  if (invoice.status === "paid" || invoice.status === "cancelled") return invoice;

  const structure = await FeeStructure.findById(invoice.feeStructure).select("lateFeePerDay maxLateFee");
  if (!structure || structure.lateFeePerDay <= 0) return invoice;

  const now = new Date();
  if (now <= invoice.dueDate) return invoice;

  const overdueDays = daysBetween(now, invoice.dueDate);
  const newLateFee = Math.min(overdueDays * structure.lateFeePerDay, structure.maxLateFee);

  if (newLateFee !== invoice.lateFeeAmount) {
    invoice.lateFeeAmount = newLateFee;
    if (invoice.status === "pending" || invoice.status === "partial") {
      invoice.status = "overdue";
    }
    await invoice.save();
  }
  return invoice;
}

export function netPayable(invoice: Pick<IFeeInvoice, "amount" | "discountAmount" | "waiverAmount" | "lateFeeAmount">) {
  return invoice.amount - invoice.discountAmount - invoice.waiverAmount + invoice.lateFeeAmount;
}

export async function generateInvoicesForStructure(
  feeStructureId: string,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const structure = await FeeStructure.findOne({ _id: feeStructureId, school: actor.school });
  if (!structure) throw ApiError.notFound("Fee structure not found");

  const alreadyInvoicedStudentIds = await FeeInvoice.find({ feeStructure: feeStructureId }).distinct("student");
  const alreadyInvoiced = new Set(alreadyInvoicedStudentIds.map(String));

  const students = await Student.find({
    school: actor.school,
    currentClass: structure.class,
    academicYear: structure.academicYear,
    status: "active",
  }).select("_id");

  const eligible = students.filter((s) => !alreadyInvoiced.has(s._id.toString()));
  if (eligible.length === 0) {
    return { studentsProcessed: 0, invoicesCreated: 0 };
  }

  const installmentAmounts = splitAmount(structure.amount, structure.installments);

  const activeScholarships = await StudentScholarship.find({
    school: actor.school,
    academicYear: structure.academicYear,
    student: { $in: eligible.map((s) => s._id) },
  }).populate("scholarship", "type value isActive");

  const scholarshipByStudent = new Map(
    activeScholarships
      .filter((a) => (a.scholarship as unknown as { isActive?: boolean })?.isActive !== false)
      .map((a) => [a.student.toString(), a.scholarship as unknown as { type: string; value: number }])
  );

  const invoicesToInsert = [];

  for (const student of eligible) {
    const scholarship = scholarshipByStudent.get(student._id.toString());
    const totalDiscount = scholarship
      ? scholarship.type === "percentage"
        ? Math.round(((structure.amount * scholarship.value) / 100) * 100) / 100
        : Math.min(scholarship.value, structure.amount)
      : 0;
    const discountInstallments = totalDiscount > 0 ? splitAmount(totalDiscount, structure.installments) : [];

    for (let i = 0; i < structure.installments; i++) {
      const dueDate = new Date(structure.dueDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      invoicesToInsert.push({
        school: actor.school,
        student: student._id,
        academicYear: structure.academicYear,
        feeCategory: structure.feeCategory,
        feeStructure: structure._id,
        installmentNumber: i + 1,
        totalInstallments: structure.installments,
        invoiceNumber: generateDocumentNumber("INV"),
        amount: installmentAmounts[i],
        discountAmount: discountInstallments[i] ?? 0,
        waiverAmount: 0,
        lateFeeAmount: 0,
        paidAmount: 0,
        dueDate,
        status: "pending" as const,
        generatedBy: actor.id,
      });
    }
  }

  await FeeInvoice.insertMany(invoicesToInsert);

  await ActivityLog.create({
    user: actor.id,
    action: "fee_invoice.generate",
    entityType: "FeeStructure",
    entityId: structure._id,
    metadata: { studentsProcessed: eligible.length, invoicesCreated: invoicesToInsert.length },
    school: actor.school,
  });

  return { studentsProcessed: eligible.length, invoicesCreated: invoicesToInsert.length };
}

export async function listInvoices(query: InvoiceQueryInput, session: AccessTokenPayload) {
  await connectDB();
  if (!session.school) return { items: [], total: 0 };

  const filter: QueryFilter<IFeeInvoice> = { school: session.school };
  if (query.status) filter.status = query.status as IFeeInvoice["status"];

  if (session.role === ROLES.STUDENT || session.role === ROLES.PARENT) {
    const { Parent } = await import("@/models/Parent");
    if (session.role === ROLES.STUDENT) {
      const own = await Student.findOne({ user: session.sub }).select("_id");
      filter.student = own?._id ?? new Types.ObjectId();
    } else {
      const parent = await Parent.findOne({ user: session.sub });
      filter.student = { $in: parent?.children ?? [] };
    }
  } else if (query.studentId) {
    filter.student = query.studentId;
  } else if (query.classId) {
    const studentsInClass = await Student.find({ school: session.school, currentClass: query.classId }).select(
      "_id"
    );
    filter.student = { $in: studentsInClass.map((s) => s._id) };
  }

  if (query.search) {
    const matchingStudents = await Student.find({
      school: session.school,
      $or: [
        { name: { $regex: query.search, $options: "i" } },
        { admissionNumber: { $regex: query.search, $options: "i" } },
      ],
    }).select("_id");
    const studentIds = matchingStudents.map((s) => s._id);
    filter.$or = [{ invoiceNumber: { $regex: query.search, $options: "i" } }, { student: { $in: studentIds } }];
  }

  const skip = (query.page - 1) * query.limit;
  const [rawItems, total] = await Promise.all([
    FeeInvoice.find(filter)
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("student", "name admissionNumber photoUrl")
      .populate("feeCategory", "name")
      .lean(),
    FeeInvoice.countDocuments(filter),
  ]);

  // Keep late-fee/overdue status fresh for anything shown to the user.
  const items = await Promise.all(
    rawItems.map(async (item) => {
      if (item.status === "paid" || item.status === "cancelled") return item;
      const now = new Date();
      if (now <= item.dueDate) return item;
      const structure = await FeeStructure.findById(item.feeStructure).select("lateFeePerDay maxLateFee").lean();
      if (!structure || structure.lateFeePerDay <= 0) return item;
      const overdueDays = daysBetween(now, item.dueDate);
      const lateFeeAmount = Math.min(overdueDays * structure.lateFeePerDay, structure.maxLateFee);
      if (lateFeeAmount !== item.lateFeeAmount) {
        await FeeInvoice.updateOne(
          { _id: item._id },
          { $set: { lateFeeAmount, status: item.status === "pending" ? "overdue" : item.status } }
        );
        return { ...item, lateFeeAmount, status: item.status === "pending" ? "overdue" : item.status };
      }
      return item;
    })
  );

  return { items, total };
}

export async function getInvoiceById(id: string, session: AccessTokenPayload) {
  await connectDB();

  const invoice = await FeeInvoice.findOne({ _id: id, ...(session.school ? { school: session.school } : {}) })
    .populate("student", "name admissionNumber photoUrl currentClass section")
    .populate("feeCategory", "name frequency");
  if (!invoice) throw ApiError.notFound("Invoice not found");

  await assertCanAccessStudent(
    invoice.student._id.toString(),
    session,
    "You don't have access to this invoice"
  );

  await recalculateLateFee(invoice);

  const payments = await FeePayment.find({ invoice: id }).sort({ paidAt: -1 }).populate("receivedBy", "name").lean();

  return { invoice, payments, netPayable: netPayable(invoice), balance: netPayable(invoice) - invoice.paidAmount };
}

export async function recordPayment(input: RecordPaymentInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const invoice = await FeeInvoice.findOne({ _id: input.invoice, school: actor.school });
  if (!invoice) throw ApiError.notFound("Invoice not found");
  if (invoice.status === "cancelled") throw ApiError.badRequest("This invoice has been cancelled");

  await recalculateLateFee(invoice);

  const payable = netPayable(invoice);
  const balance = Math.round((payable - invoice.paidAmount) * 100) / 100;
  if (balance <= 0) throw ApiError.conflict("This invoice is already fully paid");
  if (input.amount > balance + 0.01) {
    throw ApiError.badRequest(`Payment exceeds the outstanding balance of ${balance}`);
  }

  const payment = await FeePayment.create({
    school: actor.school,
    invoice: invoice._id,
    student: invoice.student,
    amount: input.amount,
    method: input.method,
    transactionRef: input.transactionRef || undefined,
    receiptNumber: generateDocumentNumber("RCPT"),
    receivedBy: actor.id,
    notes: input.notes || undefined,
  });

  invoice.paidAmount = Math.round((invoice.paidAmount + input.amount) * 100) / 100;
  invoice.status = invoice.paidAmount >= payable - 0.01 ? "paid" : "partial";
  await invoice.save();

  await ActivityLog.create({
    user: actor.id,
    action: "fee_payment.record",
    entityType: "FeePayment",
    entityId: payment._id,
    metadata: { invoice: invoice._id.toString(), amount: input.amount },
    school: actor.school,
  });

  return { payment, invoice };
}

export async function getReceiptData(paymentId: string, session: AccessTokenPayload) {
  await connectDB();

  const payment = await FeePayment.findOne({
    _id: paymentId,
    ...(session.school ? { school: session.school } : {}),
  })
    .populate("student", "name admissionNumber currentClass section")
    .populate("receivedBy", "name")
    .populate({ path: "invoice", populate: { path: "feeCategory", select: "name" } });
  if (!payment) throw ApiError.notFound("Payment not found");

  await assertCanAccessStudent(payment.student._id.toString(), session, "You don't have access to this receipt");

  const { School } = await import("@/models/School");
  const school = session.school ? await School.findById(session.school).lean() : null;

  return { payment, school };
}

export async function createWaiver(input: CreateFeeWaiverInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const invoice = await FeeInvoice.findOne({ _id: input.invoice, school: actor.school });
  if (!invoice) throw ApiError.notFound("Invoice not found");

  const payable = netPayable(invoice);
  const balance = payable - invoice.paidAmount;
  if (input.amount > balance + 0.01) throw ApiError.badRequest("Waiver exceeds the outstanding balance");

  const waiver = await FeeWaiver.create({
    school: actor.school,
    student: invoice.student,
    invoice: invoice._id,
    amount: input.amount,
    reason: input.reason,
    approvedBy: actor.id,
  });

  invoice.waiverAmount = Math.round((invoice.waiverAmount + input.amount) * 100) / 100;
  const newPayable = netPayable(invoice);
  invoice.status = invoice.paidAmount >= newPayable - 0.01 ? "paid" : invoice.paidAmount > 0 ? "partial" : "pending";
  await invoice.save();

  await ActivityLog.create({
    user: actor.id,
    action: "fee_waiver.create",
    entityType: "FeeWaiver",
    entityId: waiver._id,
    school: actor.school,
  });

  return waiver;
}

export async function listWaivers(school?: string) {
  await connectDB();
  if (!school) return [];
  return FeeWaiver.find({ school })
    .sort({ createdAt: -1 })
    .populate("student", "name admissionNumber")
    .populate("approvedBy", "name")
    .lean();
}

export async function createRefund(input: CreateRefundInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const payment = await FeePayment.findOne({ _id: input.payment, school: actor.school });
  if (!payment) throw ApiError.notFound("Payment not found");
  if (input.amount > payment.amount) throw ApiError.badRequest("Refund cannot exceed the original payment amount");

  const existingRefunds = await Refund.find({ payment: input.payment, status: { $ne: "rejected" } });
  const alreadyRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);
  if (alreadyRefunded + input.amount > payment.amount) {
    throw ApiError.badRequest("This would refund more than the original payment");
  }

  const refund = await Refund.create({
    school: actor.school,
    payment: payment._id,
    student: payment.student,
    amount: input.amount,
    reason: input.reason,
    requestedBy: actor.id,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "refund.request",
    entityType: "Refund",
    entityId: refund._id,
    school: actor.school,
  });

  return refund;
}

export async function reviewRefund(id: string, input: ReviewRefundInput, actor: { id: string; school?: string }) {
  await connectDB();

  const refund = await Refund.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!refund) throw ApiError.notFound("Refund not found");

  // Allowed transitions: pending -> approved | rejected | processed, and
  // approved -> processed. "rejected" and "processed" are terminal. This lets
  // the two-step Approve → Mark processed flow work (previously any non-pending
  // refund was rejected outright, so "Mark processed" could never succeed).
  const current = refund.status;
  const target = input.status;
  const allowed =
    (current === "pending" && (target === "approved" || target === "rejected" || target === "processed")) ||
    (current === "approved" && target === "processed");
  if (!allowed) {
    throw ApiError.conflict(`A ${current} refund can't be marked ${target}`);
  }

  refund.status = target;
  refund.approvedBy = new Types.ObjectId(actor.id);
  if (target === "processed") refund.processedAt = new Date();
  await refund.save();

  // The money only actually leaves the invoice when the refund is *processed*
  // (disbursed) — approval alone doesn't touch the balance. Because "processed"
  // is terminal, this deduction runs exactly once per refund (no double-refund).
  if (target === "processed") {
    const payment = await FeePayment.findById(refund.payment);
    const invoice = payment
      ? await FeeInvoice.findOne({ _id: payment.invoice, ...(actor.school ? { school: actor.school } : {}) })
      : null;
    if (invoice) {
      invoice.paidAmount = Math.max(0, Math.round((invoice.paidAmount - refund.amount) * 100) / 100);
      invoice.status = invoice.paidAmount >= netPayable(invoice) - 0.01 ? "paid" : invoice.paidAmount > 0 ? "partial" : "pending";
      await invoice.save();
    }
  }

  await ActivityLog.create({
    user: actor.id,
    action: "refund.review",
    entityType: "Refund",
    entityId: refund._id,
    metadata: { status: input.status },
    school: actor.school,
  });

  return refund;
}

export async function listRefunds(school?: string) {
  await connectDB();
  if (!school) return [];
  return Refund.find({ school })
    .sort({ createdAt: -1 })
    .populate("student", "name admissionNumber")
    .populate("requestedBy", "name")
    .lean();
}
