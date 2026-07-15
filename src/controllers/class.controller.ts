import { connectDB } from "@/lib/db/connect";
import { Class } from "@/models/Class";
import { Section } from "@/models/Section";
import { Student } from "@/models/Student";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { CreateClassInput, UpdateClassInput } from "@/validators/academics.validator";

export async function listClasses(school?: string) {
  await connectDB();
  if (!school) return [];

  const classes = await Class.find({ school })
    .sort({ numericLevel: 1 })
    .populate("subjects", "name code")
    .populate("academicYear", "name")
    .lean();

  const sectionCounts = await Section.aggregate([
    { $match: { school } },
    { $group: { _id: "$class", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(sectionCounts.map((s) => [s._id.toString(), s.count]));

  return classes.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    numericLevel: c.numericLevel,
    academicYear: c.academicYear,
    subjects: c.subjects,
    sectionCount: countMap.get(c._id.toString()) ?? 0,
  }));
}

export async function createClass(input: CreateClassInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await Class.findOne({
    school: actor.school,
    academicYear: input.academicYear,
    name: input.name,
  });
  if (existing) throw ApiError.conflict("This class already exists for the selected academic year");

  const cls = await Class.create({ ...input, school: actor.school });

  await ActivityLog.create({
    user: actor.id,
    action: "class.create",
    entityType: "Class",
    entityId: cls._id,
    school: actor.school,
  });

  return cls;
}

export async function updateClass(
  id: string,
  input: UpdateClassInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const cls = await Class.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!cls) throw ApiError.notFound("Class not found");

  Object.assign(cls, input);
  await cls.save();

  await ActivityLog.create({
    user: actor.id,
    action: "class.update",
    entityType: "Class",
    entityId: cls._id,
    school: actor.school,
  });

  return cls;
}

export async function deleteClass(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const cls = await Class.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!cls) throw ApiError.notFound("Class not found");

  const [studentCount, sectionCount] = await Promise.all([
    Student.countDocuments({ currentClass: cls._id }),
    Section.countDocuments({ class: cls._id }),
  ]);

  if (studentCount > 0) {
    throw ApiError.conflict("Cannot delete a class that has students enrolled");
  }
  if (sectionCount > 0) {
    throw ApiError.conflict("Remove all sections from this class first");
  }

  await cls.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "class.delete",
    entityType: "Class",
    entityId: cls._id,
    school: actor.school,
  });

  return { id: cls._id.toString() };
}
