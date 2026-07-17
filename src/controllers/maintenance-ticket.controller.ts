import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { MaintenanceTicket } from "@/models/MaintenanceTicket";
import { Technician } from "@/models/Technician";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import type {
  CreateMaintenanceTicketInput,
  AssignTechnicianInput,
  UpdateTicketStatusInput,
} from "@/validators/maintenance.validator";

export async function listMaintenanceTickets(
  session: AccessTokenPayload,
  filters: { status?: string; category?: string }
) {
  await connectDB();
  if (!session.school) return [];

  const canManage = can(session.role, PERMISSIONS.MAINTENANCE_MANAGE);
  const filter: Record<string, unknown> = {
    school: session.school,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    // Staff without MAINTENANCE_MANAGE only ever see the tickets they raised.
    ...(canManage ? {} : { raisedBy: session.sub }),
  };

  return MaintenanceTicket.find(filter)
    .sort({ createdAt: -1 })
    .populate("raisedBy", "name")
    .populate("assignedTechnician", "name phone specialization")
    .populate("timeline.by", "name")
    .lean();
}

export async function createMaintenanceTicket(
  input: CreateMaintenanceTicketInput,
  actor: AccessTokenPayload
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const ticket = await MaintenanceTicket.create({
    ...input,
    raisedBy: actor.sub,
    timeline: [{ status: "open", by: actor.sub, at: new Date() }],
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.sub,
    action: "maintenance_ticket.create",
    entityType: "MaintenanceTicket",
    entityId: ticket._id,
    school: actor.school,
  });

  return ticket;
}

export async function assignTechnician(
  id: string,
  input: AssignTechnicianInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const ticket = await MaintenanceTicket.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!ticket) throw ApiError.notFound("Ticket not found");

  const technician = await Technician.findOne({ _id: input.technician, school: actor.school });
  if (!technician) throw ApiError.badRequest("Technician not found");

  ticket.assignedTechnician = new Types.ObjectId(input.technician);
  if (ticket.status === "open") ticket.status = "assigned";
  ticket.timeline.push({
    status: ticket.status,
    note: `Assigned to ${technician.name}`,
    by: new Types.ObjectId(actor.id),
    at: new Date(),
  });
  await ticket.save();

  await ActivityLog.create({
    user: actor.id,
    action: "maintenance_ticket.assign",
    entityType: "MaintenanceTicket",
    entityId: ticket._id,
    metadata: { technician: input.technician },
    school: actor.school,
  });

  return ticket;
}

export async function updateTicketStatus(
  id: string,
  input: UpdateTicketStatusInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const ticket = await MaintenanceTicket.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!ticket) throw ApiError.notFound("Ticket not found");

  ticket.status = input.status;
  ticket.timeline.push({
    status: input.status,
    note: input.note || undefined,
    by: new Types.ObjectId(actor.id),
    at: new Date(),
  });
  if (input.status === "resolved" || input.status === "closed") {
    ticket.resolvedAt = ticket.resolvedAt ?? new Date();
    if (input.note) ticket.resolutionNote = input.note;
  }
  await ticket.save();

  await ActivityLog.create({
    user: actor.id,
    action: "maintenance_ticket.status_update",
    entityType: "MaintenanceTicket",
    entityId: ticket._id,
    metadata: { status: input.status },
    school: actor.school,
  });

  return ticket;
}
