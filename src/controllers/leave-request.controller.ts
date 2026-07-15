import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { LeaveRequest } from "@/models/LeaveRequest";
import { Student } from "@/models/Student";
import { Parent } from "@/models/Parent";
import { Notification } from "@/models/Notification";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { ROLES } from "@/types/roles";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type {
  CreateLeaveRequestInput,
  ReviewLeaveRequestInput,
} from "@/validators/hostel.validator";

async function assertCanActForStudent(studentId: string, session: AccessTokenPayload) {
  if (session.role === ROLES.STUDENT) {
    const own = await Student.findOne({ user: session.sub }).select("_id");
    if (!own || own._id.toString() !== studentId) {
      throw ApiError.forbidden("You can only submit a leave request for yourself");
    }
    return;
  }

  if (session.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ user: session.sub, children: studentId });
    if (!parent) throw ApiError.forbidden("This student isn't linked to your account");
    return;
  }
}

export async function listLeaveRequests(
  session: AccessTokenPayload,
  filters: { status?: string; studentId?: string }
) {
  await connectDB();

  const filter: Record<string, unknown> = { ...(session.school ? { school: session.school } : {}) };
  if (filters.status) filter.status = filters.status;

  if (session.role === ROLES.STUDENT) {
    const own = await Student.findOne({ user: session.sub }).select("_id");
    filter.student = own?._id ?? null;
  } else if (session.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ user: session.sub });
    filter.student = { $in: parent?.children ?? [] };
  } else if (filters.studentId) {
    filter.student = filters.studentId;
  }

  const requests = await LeaveRequest.find(filter)
    .sort({ createdAt: -1 })
    .populate("student", "name admissionNumber photoUrl")
    .populate("requestedBy", "name role")
    .populate("reviewedBy", "name")
    .lean();

  return requests.map((r) => ({
    id: r._id.toString(),
    student: r.student,
    requestedBy: r.requestedBy,
    fromDate: r.fromDate,
    toDate: r.toDate,
    reason: r.reason,
    status: r.status,
    reviewedBy: r.reviewedBy,
    reviewNote: r.reviewNote,
    createdAt: r.createdAt,
  }));
}

export async function createLeaveRequest(input: CreateLeaveRequestInput, session: AccessTokenPayload) {
  await connectDB();
  if (!session.school) throw ApiError.badRequest("Your account is not linked to a school");

  await assertCanActForStudent(input.student, session);

  const request = await LeaveRequest.create({
    student: input.student,
    requestedBy: session.sub,
    fromDate: new Date(input.fromDate),
    toDate: new Date(input.toDate),
    reason: input.reason,
    status: "pending",
    school: session.school,
  });

  const student = await Student.findById(input.student).select("name");

  await Notification.create({
    title: "New hostel leave request",
    message: `${student?.name ?? "A student"} has requested leave from ${input.fromDate} to ${input.toDate}.`,
    type: "info",
    audienceScope: "roles",
    audienceRoles: [ROLES.HOSTEL_WARDEN, ROLES.PRINCIPAL],
    sender: session.sub,
    school: session.school,
  });

  await ActivityLog.create({
    user: session.sub,
    action: "leave_request.create",
    entityType: "LeaveRequest",
    entityId: request._id,
    school: session.school,
  });

  return request;
}

export async function reviewLeaveRequest(
  id: string,
  input: ReviewLeaveRequestInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const request = await LeaveRequest.findOne({
    _id: id,
    ...(actor.school ? { school: actor.school } : {}),
  });
  if (!request) throw ApiError.notFound("Leave request not found");
  if (request.status !== "pending") {
    throw ApiError.conflict("This request has already been reviewed");
  }

  request.status = input.status;
  request.reviewNote = input.reviewNote || undefined;
  request.reviewedBy = new Types.ObjectId(actor.id);
  request.reviewedAt = new Date();
  await request.save();

  await Notification.create({
    title: `Leave request ${input.status}`,
    message: input.reviewNote || `Your leave request has been ${input.status}.`,
    type: input.status === "approved" ? "success" : "warning",
    audienceScope: "users",
    audienceUsers: [request.requestedBy],
    sender: actor.id,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "leave_request.review",
    entityType: "LeaveRequest",
    entityId: request._id,
    metadata: { status: input.status },
    school: actor.school,
  });

  return request;
}
