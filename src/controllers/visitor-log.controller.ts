import { connectDB } from "@/lib/db/connect";
import { VisitorLog } from "@/models/VisitorLog";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { CreateVisitorLogInput } from "@/validators/hostel.validator";

export async function listVisitorLogs(school?: string) {
  await connectDB();
  if (!school) return [];

  const logs = await VisitorLog.find({ school })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("student", "name admissionNumber photoUrl")
    .populate("approvedBy", "name")
    .lean();

  return logs.map((v) => ({
    id: v._id.toString(),
    student: v.student,
    visitorName: v.visitorName,
    visitorPhone: v.visitorPhone,
    relation: v.relation,
    purpose: v.purpose,
    checkInTime: v.checkInTime,
    checkOutTime: v.checkOutTime,
    approvedBy: v.approvedBy,
  }));
}

export async function createVisitorLog(
  input: CreateVisitorLogInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const log = await VisitorLog.create({
    ...input,
    approvedBy: actor.id,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "visitor_log.create",
    entityType: "VisitorLog",
    entityId: log._id,
    school: actor.school,
  });

  return log;
}

export async function checkOutVisitor(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const log = await VisitorLog.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!log) throw ApiError.notFound("Visitor record not found");
  if (log.checkOutTime) throw ApiError.conflict("This visitor is already checked out");

  log.checkOutTime = new Date();
  await log.save();

  await ActivityLog.create({
    user: actor.id,
    action: "visitor_log.checkout",
    entityType: "VisitorLog",
    entityId: log._id,
    school: actor.school,
  });

  return log;
}
