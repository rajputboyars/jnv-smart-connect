import { connectDB } from "@/lib/db/connect";
import { AcademicYear } from "@/models/AcademicYear";
import { School } from "@/models/School";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type {
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
} from "@/validators/academics.validator";

export async function listAcademicYears(school?: string) {
  await connectDB();
  if (!school) return [];

  const years = await AcademicYear.find({ school }).sort({ startDate: -1 }).lean();
  return years.map((y) => ({
    id: y._id.toString(),
    name: y.name,
    startDate: y.startDate,
    endDate: y.endDate,
    isActive: y.isActive,
  }));
}

export async function createAcademicYear(
  input: CreateAcademicYearInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await AcademicYear.findOne({ school: actor.school, name: input.name });
  if (existing) {
    throw ApiError.conflict("An academic year with this name already exists");
  }

  const year = await AcademicYear.create({
    name: input.name,
    school: actor.school,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    isActive: false,
  });

  if (input.isActive) {
    await setActiveAcademicYear(year._id.toString(), actor);
  }

  await ActivityLog.create({
    user: actor.id,
    action: "academic_year.create",
    entityType: "AcademicYear",
    entityId: year._id,
    school: actor.school,
  });

  return year;
}

export async function updateAcademicYear(
  id: string,
  input: UpdateAcademicYearInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const year = await AcademicYear.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!year) throw ApiError.notFound("Academic year not found");

  if (input.name) year.name = input.name;
  if (input.startDate) year.startDate = new Date(input.startDate);
  if (input.endDate) year.endDate = new Date(input.endDate);
  await year.save();

  if (input.isActive) {
    await setActiveAcademicYear(year._id.toString(), actor);
  }

  await ActivityLog.create({
    user: actor.id,
    action: "academic_year.update",
    entityType: "AcademicYear",
    entityId: year._id,
    school: actor.school,
  });

  return year;
}

async function setActiveAcademicYear(id: string, actor: { id: string; school?: string }) {
  if (!actor.school) return;

  await AcademicYear.updateMany({ school: actor.school }, { $set: { isActive: false } });
  await AcademicYear.findByIdAndUpdate(id, { $set: { isActive: true } });
  await School.findByIdAndUpdate(actor.school, { $set: { activeAcademicYear: id } });
}

export async function deleteAcademicYear(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const year = await AcademicYear.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!year) throw ApiError.notFound("Academic year not found");

  if (year.isActive) {
    throw ApiError.badRequest("Cannot delete the active academic year. Activate another year first.");
  }

  await year.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "academic_year.delete",
    entityType: "AcademicYear",
    entityId: year._id,
    school: actor.school,
  });

  return { id: year._id.toString() };
}
