import { connectDB } from "@/lib/db/connect";
import { Event } from "@/models/Event";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { CreateEventInput } from "@/validators/event.validator";
import type { EventType } from "@/models/enums";

export async function listEvents(school?: string, type?: EventType) {
  await connectDB();
  if (!school) return [];
  return Event.find({ school, ...(type ? { type } : {}) })
    .sort({ startDate: -1 })
    .populate("organizer", "name")
    .lean();
}

export async function createEvent(input: CreateEventInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const event = await Event.create({
    ...input,
    description: input.description || undefined,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    organizer: actor.id,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "event.create",
    entityType: "Event",
    entityId: event._id,
    school: actor.school,
  });

  return event;
}
