import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { StaffLeaveRequest } from "@/models/StaffLeaveRequest";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { resolveOwnTeacherId, findOwnTeacherId } from "@/lib/auth/teacher-scope";
import type {
  CreateStaffLeaveRequestInput,
  ReviewStaffLeaveRequestInput,
} from "@/validators/hr.validator";

export async function listStaffLeaveRequests(session: AccessTokenPayload, status?: string) {
  await connectDB();
  if (!session.school) return [];

  const canManage = can(session.role, PERMISSIONS.HR_MANAGE);
  // Staff without HR_MANAGE only ever see their own requests — this endpoint
  // doubles as "my leave" for regular staff and "all leave" for HR. A staff
  // member with no employee record simply has no leave to show.
  let ownTeacherId: string | null = null;
  if (!canManage) {
    ownTeacherId = await findOwnTeacherId(session);
    if (!ownTeacherId) return [];
  }

  const filter: Record<string, unknown> = {
    school: session.school,
    ...(status ? { status } : {}),
    ...(canManage ? {} : { teacher: ownTeacherId }),
  };

  return StaffLeaveRequest.find(filter)
    .sort({ createdAt: -1 })
    .populate("teacher", "name employeeId designation")
    .populate("reviewedBy", "name")
    .lean();
}

export async function createStaffLeaveRequest(
  input: CreateStaffLeaveRequestInput,
  actor: AccessTokenPayload
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const teacherId = await resolveOwnTeacherId(actor);

  const request = await StaffLeaveRequest.create({
    teacher: teacherId,
    leaveType: input.leaveType,
    fromDate: new Date(input.fromDate),
    toDate: new Date(input.toDate),
    reason: input.reason,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.sub,
    action: "staff_leave.create",
    entityType: "StaffLeaveRequest",
    entityId: request._id,
    school: actor.school,
  });

  return request;
}

export async function reviewStaffLeaveRequest(
  id: string,
  input: ReviewStaffLeaveRequestInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const request = await StaffLeaveRequest.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!request) throw ApiError.notFound("Leave request not found");

  request.status = input.status;
  request.reviewedBy = new Types.ObjectId(actor.id);
  request.reviewNote = input.reviewNote || undefined;
  request.reviewedAt = new Date();
  await request.save();

  await ActivityLog.create({
    user: actor.id,
    action: "staff_leave.review",
    entityType: "StaffLeaveRequest",
    entityId: request._id,
    metadata: { status: input.status },
    school: actor.school,
  });

  return request;
}
