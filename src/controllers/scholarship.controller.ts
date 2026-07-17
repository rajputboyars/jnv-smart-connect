import { connectDB } from "@/lib/db/connect";
import { Scholarship } from "@/models/Scholarship";
import { StudentScholarship } from "@/models/StudentScholarship";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { assertStudentInSchool } from "@/lib/auth/student-scope";
import type {
  CreateScholarshipInput,
  UpdateScholarshipInput,
  AssignScholarshipInput,
} from "@/validators/finance.validator";

export async function listScholarships(school?: string) {
  await connectDB();
  if (!school) return [];
  return Scholarship.find({ school }).sort({ name: 1 }).lean();
}

export async function createScholarship(
  input: CreateScholarshipInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const scholarship = await Scholarship.create({
    ...input,
    criteria: input.criteria || undefined,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "scholarship.create",
    entityType: "Scholarship",
    entityId: scholarship._id,
    school: actor.school,
  });

  return scholarship;
}

export async function updateScholarship(
  id: string,
  input: UpdateScholarshipInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const scholarship = await Scholarship.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!scholarship) throw ApiError.notFound("Scholarship not found");

  Object.assign(scholarship, input);
  await scholarship.save();

  await ActivityLog.create({
    user: actor.id,
    action: "scholarship.update",
    entityType: "Scholarship",
    entityId: scholarship._id,
    school: actor.school,
  });

  return scholarship;
}

export async function listStudentScholarships(school?: string, studentId?: string) {
  await connectDB();
  if (!school) return [];

  return StudentScholarship.find({ school, ...(studentId ? { student: studentId } : {}) })
    .sort({ createdAt: -1 })
    .populate("student", "name admissionNumber")
    .populate("scholarship", "name type value")
    .populate("academicYear", "name")
    .populate("approvedBy", "name")
    .lean();
}

export async function assignScholarship(
  input: AssignScholarshipInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");
  await assertStudentInSchool(input.student, actor.school);

  const scholarship = await Scholarship.findOne({ _id: input.scholarship, school: actor.school });
  if (!scholarship) throw ApiError.badRequest("Scholarship not found");

  const existing = await StudentScholarship.findOne({
    student: input.student,
    scholarship: input.scholarship,
    academicYear: input.academicYear,
  });
  if (existing) throw ApiError.conflict("This scholarship is already assigned for this academic year");

  const assignment = await StudentScholarship.create({
    ...input,
    remarks: input.remarks || undefined,
    school: actor.school,
    approvedBy: actor.id,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "student_scholarship.assign",
    entityType: "StudentScholarship",
    entityId: assignment._id,
    school: actor.school,
  });

  return assignment;
}

export async function revokeScholarship(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const assignment = await StudentScholarship.findOne({
    _id: id,
    ...(actor.school ? { school: actor.school } : {}),
  });
  if (!assignment) throw ApiError.notFound("Scholarship assignment not found");

  await assignment.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "student_scholarship.revoke",
    entityType: "StudentScholarship",
    entityId: id,
    school: actor.school,
  });
}
