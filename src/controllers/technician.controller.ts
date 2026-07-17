import { connectDB } from "@/lib/db/connect";
import { Technician } from "@/models/Technician";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { MaintenanceCategory } from "@/models/enums";
import type { CreateTechnicianInput } from "@/validators/maintenance.validator";

export async function listTechnicians(school?: string, specialization?: MaintenanceCategory) {
  await connectDB();
  if (!school) return [];
  return Technician.find({ school, active: true, ...(specialization ? { specialization } : {}) })
    .sort({ name: 1 })
    .lean();
}

export async function createTechnician(input: CreateTechnicianInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const technician = await Technician.create({
    ...input,
    email: input.email || undefined,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "technician.create",
    entityType: "Technician",
    entityId: technician._id,
    school: actor.school,
  });

  return technician;
}
