import { connectDB } from "@/lib/db/connect";
import { Subject } from "@/models/Subject";
import { Class } from "@/models/Class";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { CreateSubjectInput, UpdateSubjectInput } from "@/validators/academics.validator";

export async function listSubjectsFull(school?: string) {
  await connectDB();
  if (!school) return [];

  const subjects = await Subject.find({ school }).sort({ name: 1 }).lean();
  return subjects.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    code: s.code,
    type: s.type,
  }));
}

export async function createSubject(
  input: CreateSubjectInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await Subject.findOne({ school: actor.school, code: input.code.toUpperCase() });
  if (existing) throw ApiError.conflict("A subject with this code already exists");

  const subject = await Subject.create({
    name: input.name,
    code: input.code.toUpperCase(),
    type: input.type,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "subject.create",
    entityType: "Subject",
    entityId: subject._id,
    school: actor.school,
  });

  return subject;
}

export async function updateSubject(
  id: string,
  input: UpdateSubjectInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const subject = await Subject.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!subject) throw ApiError.notFound("Subject not found");

  if (input.name) subject.name = input.name;
  if (input.code) subject.code = input.code.toUpperCase();
  if (input.type) subject.type = input.type;
  await subject.save();

  await ActivityLog.create({
    user: actor.id,
    action: "subject.update",
    entityType: "Subject",
    entityId: subject._id,
    school: actor.school,
  });

  return subject;
}

export async function deleteSubject(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const subject = await Subject.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!subject) throw ApiError.notFound("Subject not found");

  const classCount = await Class.countDocuments({ subjects: subject._id });
  if (classCount > 0) {
    throw ApiError.conflict("Remove this subject from all classes first");
  }

  await subject.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "subject.delete",
    entityType: "Subject",
    entityId: subject._id,
    school: actor.school,
  });

  return { id: subject._id.toString() };
}
