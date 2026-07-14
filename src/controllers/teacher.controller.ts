import { type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Teacher, type ITeacher } from "@/models/Teacher";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { provisionLinkedAccount } from "@/controllers/auth.controller";
import { ROLES } from "@/types/roles";
import type { CreateTeacherInput, UpdateTeacherInput, TeacherQueryInput } from "@/validators/teacher.validator";

function toDocFields(input: Partial<CreateTeacherInput>) {
  const { joiningDate, ...rest } = input;
  return {
    ...rest,
    ...(joiningDate ? { joiningDate: new Date(joiningDate) } : {}),
    photoUrl: input.photoUrl || undefined,
    designation: input.designation || undefined,
  };
}

export async function listTeachers(query: TeacherQueryInput, school?: string) {
  await connectDB();

  const filter: QueryFilter<ITeacher> = {
    ...(school ? { school } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          $or: [
            { name: { $regex: query.search, $options: "i" } },
            { employeeId: { $regex: query.search, $options: "i" } },
            { email: { $regex: query.search, $options: "i" } },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Teacher.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("subjects", "name")
      .lean(),
    Teacher.countDocuments(filter),
  ]);

  return { items, total };
}

export async function getTeacherById(id: string, school?: string) {
  await connectDB();

  const teacher = await Teacher.findOne({ _id: id, ...(school ? { school } : {}) })
    .populate("subjects", "name code")
    .populate("assignedClasses.class", "name")
    .populate("assignedClasses.section", "name")
    .populate("assignedClasses.subject", "name")
    .lean();

  if (!teacher) {
    throw ApiError.notFound("Teacher not found");
  }

  return teacher;
}

export async function createTeacher(
  input: CreateTeacherInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  if (!actor.school) {
    throw ApiError.badRequest("Your account is not linked to a school");
  }

  const existing = await Teacher.findOne({
    school: actor.school,
    employeeId: input.employeeId.toUpperCase(),
  });
  if (existing) {
    throw ApiError.conflict("A teacher with this employee ID already exists");
  }

  const user = await provisionLinkedAccount(
    ROLES.TEACHER,
    { name: input.name, email: input.email, phone: input.phone },
    actor.school
  );

  const teacher = await Teacher.create({
    ...toDocFields(input),
    employeeId: input.employeeId.toUpperCase(),
    user: user._id,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "teacher.create",
    entityType: "Teacher",
    entityId: teacher._id,
    school: actor.school,
  });

  return teacher;
}

export async function updateTeacher(
  id: string,
  input: UpdateTeacherInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const teacher = await Teacher.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!teacher) {
    throw ApiError.notFound("Teacher not found");
  }

  Object.assign(teacher, toDocFields(input));
  await teacher.save();

  await ActivityLog.create({
    user: actor.id,
    action: "teacher.update",
    entityType: "Teacher",
    entityId: teacher._id,
    school: actor.school,
  });

  return teacher;
}

export async function deleteTeacher(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const teacher = await Teacher.findOneAndDelete({
    _id: id,
    ...(actor.school ? { school: actor.school } : {}),
  });

  if (!teacher) {
    throw ApiError.notFound("Teacher not found");
  }

  await ActivityLog.create({
    user: actor.id,
    action: "teacher.delete",
    entityType: "Teacher",
    entityId: teacher._id,
    school: actor.school,
  });

  return { id: teacher._id.toString() };
}
