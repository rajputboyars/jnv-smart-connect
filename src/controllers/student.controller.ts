import { Types, type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Student, type IStudent } from "@/models/Student";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type {
  CreateStudentInput,
  UpdateStudentInput,
  StudentQueryInput,
} from "@/validators/student.validator";

function toDocFields(input: Partial<CreateStudentInput>) {
  const { dob, ...rest } = input;
  return {
    ...rest,
    ...(dob ? { dob: new Date(dob) } : {}),
    aadhaarNumber: input.aadhaarNumber || undefined,
    rollNumber: input.rollNumber || undefined,
    photoUrl: input.photoUrl || undefined,
    previousSchool: input.previousSchool || undefined,
  };
}

export async function listStudents(query: StudentQueryInput, school?: string) {
  await connectDB();

  const filter: QueryFilter<IStudent> = {
    ...(school ? { school } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.classId ? { currentClass: new Types.ObjectId(query.classId) } : {}),
    ...(query.sectionId ? { section: new Types.ObjectId(query.sectionId) } : {}),
    ...(query.search
      ? {
          $or: [
            { name: { $regex: query.search, $options: "i" } },
            { admissionNumber: { $regex: query.search, $options: "i" } },
            { rollNumber: { $regex: query.search, $options: "i" } },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Student.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("currentClass", "name")
      .populate("section", "name")
      .lean(),
    Student.countDocuments(filter),
  ]);

  return { items, total };
}

export async function getStudentById(id: string, school?: string) {
  await connectDB();

  const student = await Student.findOne({ _id: id, ...(school ? { school } : {}) })
    .populate("currentClass", "name numericLevel")
    .populate("section", "name")
    .populate("parents", "name phone email")
    .lean();

  if (!student) {
    throw ApiError.notFound("Student not found");
  }

  return student;
}

export async function createStudent(
  input: CreateStudentInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  if (!actor.school) {
    throw ApiError.badRequest("Your account is not linked to a school");
  }

  const existing = await Student.findOne({
    school: actor.school,
    admissionNumber: input.admissionNumber.toUpperCase(),
  });

  if (existing) {
    throw ApiError.conflict("A student with this admission number already exists");
  }

  const student = await Student.create({
    ...toDocFields(input),
    admissionNumber: input.admissionNumber.toUpperCase(),
    school: actor.school,
    academicYear: await resolveActiveAcademicYear(actor.school),
  });

  await ActivityLog.create({
    user: actor.id,
    action: "student.create",
    entityType: "Student",
    entityId: student._id,
    school: actor.school,
  });

  return student;
}

export async function updateStudent(
  id: string,
  input: UpdateStudentInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const student = await Student.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!student) {
    throw ApiError.notFound("Student not found");
  }

  Object.assign(student, toDocFields(input));
  await student.save();

  await ActivityLog.create({
    user: actor.id,
    action: "student.update",
    entityType: "Student",
    entityId: student._id,
    school: actor.school,
  });

  return student;
}

export async function deleteStudent(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const student = await Student.findOneAndDelete({
    _id: id,
    ...(actor.school ? { school: actor.school } : {}),
  });

  if (!student) {
    throw ApiError.notFound("Student not found");
  }

  await ActivityLog.create({
    user: actor.id,
    action: "student.delete",
    entityType: "Student",
    entityId: student._id,
    school: actor.school,
  });

  return { id: student._id.toString() };
}

async function resolveActiveAcademicYear(school: string) {
  const { School } = await import("@/models/School");
  const { AcademicYear } = await import("@/models/AcademicYear");

  const schoolDoc = await School.findById(school).select("activeAcademicYear");
  if (schoolDoc?.activeAcademicYear) {
    return schoolDoc.activeAcademicYear;
  }

  const latest = await AcademicYear.findOne({ school }).sort({ startDate: -1 });
  if (!latest) {
    throw ApiError.badRequest(
      "No academic year configured for your school yet. Ask a Super Admin to set one up."
    );
  }

  return latest._id;
}
