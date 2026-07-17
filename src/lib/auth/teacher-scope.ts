import { Teacher } from "@/models/Teacher";
import { ApiError } from "@/lib/utils/api-error";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

/**
 * Resolves the Teacher (employee) record linked to the signed-in user. HR
 * self-service (leave requests, salary, documents) is scoped to "your own"
 * employee record, which is this one.
 */
export async function resolveOwnTeacherId(session: AccessTokenPayload): Promise<string> {
  const teacher = await Teacher.findOne({ user: session.sub, ...(session.school ? { school: session.school } : {}) })
    .select("_id")
    .lean();
  if (!teacher) throw ApiError.badRequest("No employee record is linked to your account");
  return teacher._id.toString();
}

/**
 * Shared scoping rule for any HR endpoint that takes an arbitrary
 * `teacherId`: HR_MANAGE holders (Principal/Accountant/…) have full oversight,
 * everyone else (self-service HR_VIEW) may only reach their own employee
 * record — otherwise any teacher could pull another teacher's salary,
 * leave history, or documents by id.
 */
export async function assertCanAccessTeacherRecord(
  teacherId: string,
  session: AccessTokenPayload,
  deniedMessage = "You do not have access to this employee's records"
): Promise<void> {
  if (can(session.role, PERMISSIONS.HR_MANAGE)) return;

  const ownId = await resolveOwnTeacherId(session);
  if (ownId !== teacherId) throw ApiError.forbidden(deniedMessage);
}
