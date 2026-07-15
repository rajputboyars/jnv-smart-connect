import { Student } from "@/models/Student";
import { Parent } from "@/models/Parent";
import { Teacher } from "@/models/Teacher";
import { ApiError } from "@/lib/utils/api-error";
import { ROLES } from "@/types/roles";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

/**
 * Shared scoping rule for any endpoint that takes an arbitrary `studentId`
 * and is gated by a permission held broadly (by Students/Parents/Teachers,
 * not just senior staff): Students may only access their own record,
 * Parents only their linked children, and Teachers only students in a
 * class/section they're actually assigned to. Senior staff (Principal/Vice
 * Principal/Hostel Warden/…) are intentionally not restricted here — they
 * either hold the paired `_MANAGE` permission already, or are meant to have
 * school-wide oversight.
 *
 * Without this check, pairing a broad `_VIEW`/`_USE` permission with the
 * school-wide `STUDENTS_VIEW` permission (which every staff role holds)
 * would let any teacher enumerate every student in the school and pull
 * another teacher's students' health/AI-summary data by id.
 */
export async function assertCanAccessStudent(
  studentId: string,
  session: AccessTokenPayload,
  deniedMessage = "You do not have access to this student's records"
): Promise<void> {
  if (session.role === ROLES.STUDENT) {
    const own = await Student.findOne({ user: session.sub }).select("_id");
    if (!own || own._id.toString() !== studentId) {
      throw ApiError.forbidden(deniedMessage);
    }
    return;
  }

  if (session.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ user: session.sub, children: studentId });
    if (!parent) throw ApiError.forbidden(deniedMessage);
    return;
  }

  if (session.role === ROLES.TEACHER) {
    const student = await Student.findById(studentId).select("currentClass section").lean();
    if (!student) throw ApiError.notFound("Student not found");

    const teacher = await Teacher.findOne({ user: session.sub }).select("assignedClasses").lean();
    const teachesStudent = teacher?.assignedClasses.some(
      (a) =>
        a.class.toString() === student.currentClass.toString() &&
        a.section.toString() === student.section.toString()
    );
    if (!teachesStudent) throw ApiError.forbidden(deniedMessage);
  }
}

/**
 * Multi-tenancy guard for staff-initiated writes that reference a student by
 * id (issuing a gate pass, allocating a hostel bed, logging a medicine dose,
 * issuing a library book, filing a leave request, …). Every one of those
 * `student` ids comes straight from client input — without this check, a
 * staff member at one school could create records against another school's
 * student (the write itself would be correctly stamped with the *actor's*
 * school, but the referenced student would belong to a different tenant,
 * silently leaking that other school's student into the wrong tenant's
 * hostel/health/library data whenever it's looked up by student id).
 */
export async function assertStudentInSchool(studentId: string, school: string | undefined): Promise<void> {
  if (!school) throw ApiError.badRequest("Your account is not linked to a school");

  const exists = await Student.exists({ _id: studentId, school });
  if (!exists) throw ApiError.notFound("Student not found");
}
