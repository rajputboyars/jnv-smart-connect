import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Section } from "@/models/Section";
import { Class } from "@/models/Class";
import { Student } from "@/models/Student";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { CreateSectionInput, UpdateSectionInput } from "@/validators/academics.validator";

export async function listSections(school?: string) {
  await connectDB();
  if (!school) return [];

  const sections = await Section.find({ school })
    .sort({ name: 1 })
    .populate("class", "name numericLevel")
    .populate("classTeacher", "name employeeId")
    .lean();

  const studentCounts = await Student.aggregate([
    { $match: { school, status: "active" } },
    { $group: { _id: "$section", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(studentCounts.map((s) => [s._id.toString(), s.count]));

  return sections.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    class: s.class,
    classTeacher: s.classTeacher,
    capacity: s.capacity,
    studentCount: countMap.get(s._id.toString()) ?? 0,
  }));
}

export async function createSection(
  input: CreateSectionInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const cls = await Class.findOne({ _id: input.class, school: actor.school });
  if (!cls) throw ApiError.badRequest("Selected class was not found");

  const existing = await Section.findOne({ class: input.class, name: input.name.toUpperCase() });
  if (existing) throw ApiError.conflict("This section already exists for the selected class");

  const section = await Section.create({
    name: input.name.toUpperCase(),
    class: input.class,
    academicYear: input.academicYear,
    capacity: input.capacity,
    classTeacher: input.classTeacher || undefined,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "section.create",
    entityType: "Section",
    entityId: section._id,
    school: actor.school,
  });

  return section;
}

export async function updateSection(
  id: string,
  input: UpdateSectionInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const section = await Section.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!section) throw ApiError.notFound("Section not found");

  if (input.name) section.name = input.name.toUpperCase();
  if (input.capacity !== undefined) section.capacity = input.capacity;
  if (input.classTeacher !== undefined) {
    section.classTeacher = input.classTeacher ? new Types.ObjectId(input.classTeacher) : undefined;
  }
  await section.save();

  await ActivityLog.create({
    user: actor.id,
    action: "section.update",
    entityType: "Section",
    entityId: section._id,
    school: actor.school,
  });

  return section;
}

export async function deleteSection(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const section = await Section.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!section) throw ApiError.notFound("Section not found");

  const studentCount = await Student.countDocuments({ section: section._id });
  if (studentCount > 0) {
    throw ApiError.conflict("Cannot delete a section that has students enrolled");
  }

  await section.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "section.delete",
    entityType: "Section",
    entityId: section._id,
    school: actor.school,
  });

  return { id: section._id.toString() };
}
