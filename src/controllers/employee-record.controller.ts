import { connectDB } from "@/lib/db/connect";
import { Teacher } from "@/models/Teacher";
import { PromotionHistory } from "@/models/PromotionHistory";
import { EmployeeDocument } from "@/models/EmployeeDocument";
import { PerformanceReview } from "@/models/PerformanceReview";
import { SalaryStructure } from "@/models/SalaryStructure";
import { Payslip } from "@/models/Payslip";
import { StaffLeaveRequest } from "@/models/StaffLeaveRequest";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { assertCanAccessTeacherRecord } from "@/lib/auth/teacher-scope";
import type {
  CreatePromotionHistoryInput,
  CreateEmployeeDocumentInput,
  CreatePerformanceReviewInput,
} from "@/validators/hr.validator";

export async function listPromotionHistory(teacherId: string, session: AccessTokenPayload) {
  await connectDB();
  await assertCanAccessTeacherRecord(teacherId, session);
  return PromotionHistory.find({ teacher: teacherId, school: session.school })
    .sort({ effectiveDate: -1 })
    .populate("approvedBy", "name")
    .lean();
}

export async function createPromotionHistory(
  input: CreatePromotionHistoryInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const teacher = await Teacher.findOne({ _id: input.teacher, school: actor.school });
  if (!teacher) throw ApiError.badRequest("Teacher not found");

  const promotion = await PromotionHistory.create({
    teacher: input.teacher,
    fromDesignation: input.fromDesignation,
    toDesignation: input.toDesignation,
    effectiveDate: new Date(input.effectiveDate),
    remarks: input.remarks || undefined,
    approvedBy: actor.id,
    school: actor.school,
  });

  teacher.designation = input.toDesignation;
  await teacher.save();

  await ActivityLog.create({
    user: actor.id,
    action: "promotion_history.create",
    entityType: "PromotionHistory",
    entityId: promotion._id,
    school: actor.school,
  });

  return promotion;
}

export async function listEmployeeDocuments(teacherId: string, session: AccessTokenPayload) {
  await connectDB();
  await assertCanAccessTeacherRecord(teacherId, session);
  return EmployeeDocument.find({ teacher: teacherId, school: session.school })
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "name")
    .lean();
}

export async function createEmployeeDocument(
  input: CreateEmployeeDocumentInput,
  actor: AccessTokenPayload
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  await assertCanAccessTeacherRecord(input.teacher, actor);

  const teacher = await Teacher.findOne({ _id: input.teacher, school: actor.school });
  if (!teacher) throw ApiError.badRequest("Teacher not found");

  const document = await EmployeeDocument.create({
    teacher: input.teacher,
    docType: input.docType,
    fileUrl: input.fileUrl,
    fileName: input.fileName,
    uploadedBy: actor.sub,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.sub,
    action: "employee_document.upload",
    entityType: "EmployeeDocument",
    entityId: document._id,
    school: actor.school,
  });

  return document;
}

export async function deleteEmployeeDocument(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const document = await EmployeeDocument.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!document) throw ApiError.notFound("Document not found");

  await document.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "employee_document.delete",
    entityType: "EmployeeDocument",
    entityId: id,
    school: actor.school,
  });
}

export async function listPerformanceReviews(teacherId: string, session: AccessTokenPayload) {
  await connectDB();
  await assertCanAccessTeacherRecord(teacherId, session);
  return PerformanceReview.find({ teacher: teacherId, school: session.school })
    .sort({ reviewDate: -1 })
    .populate("reviewedBy", "name")
    .populate("academicYear", "name")
    .lean();
}

export async function createPerformanceReview(
  input: CreatePerformanceReviewInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const teacher = await Teacher.findOne({ _id: input.teacher, school: actor.school });
  if (!teacher) throw ApiError.badRequest("Teacher not found");

  const review = await PerformanceReview.create({
    teacher: input.teacher,
    academicYear: input.academicYear,
    reviewedBy: actor.id,
    rating: input.rating,
    strengths: input.strengths || undefined,
    areasOfImprovement: input.areasOfImprovement || undefined,
    goals: input.goals || undefined,
    reviewDate: new Date(input.reviewDate),
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "performance_review.create",
    entityType: "PerformanceReview",
    entityId: review._id,
    school: actor.school,
  });

  return review;
}

/** The "Digital Employee File" — a single read-model combining every HR record for one teacher. */
export async function getEmployeeFile(teacherId: string, session: AccessTokenPayload) {
  await connectDB();
  await assertCanAccessTeacherRecord(teacherId, session);

  const teacher = await Teacher.findOne({ _id: teacherId, school: session.school }).lean();
  if (!teacher) throw ApiError.notFound("Teacher not found");

  const [salaryStructure, recentPayslips, promotions, documents, reviews, leaveRequests] = await Promise.all([
    SalaryStructure.findOne({ teacher: teacherId, school: session.school }).sort({ effectiveFrom: -1 }).lean(),
    Payslip.find({ teacher: teacherId, school: session.school }).sort({ year: -1, month: -1 }).limit(12).lean(),
    PromotionHistory.find({ teacher: teacherId, school: session.school }).sort({ effectiveDate: -1 }).lean(),
    EmployeeDocument.find({ teacher: teacherId, school: session.school }).sort({ createdAt: -1 }).lean(),
    PerformanceReview.find({ teacher: teacherId, school: session.school }).sort({ reviewDate: -1 }).lean(),
    StaffLeaveRequest.find({ teacher: teacherId, school: session.school }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  return { teacher, salaryStructure, recentPayslips, promotions, documents, reviews, leaveRequests };
}
