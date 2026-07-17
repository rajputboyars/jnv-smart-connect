import { connectDB } from "@/lib/db/connect";
import { EventPhoto } from "@/models/EventPhoto";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { CreateEventPhotoInput } from "@/validators/event.validator";

export async function listEventPhotos(eventId: string, school?: string) {
  await connectDB();
  return EventPhoto.find({ event: eventId, ...(school ? { school } : {}) })
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "name")
    .lean();
}

export async function addEventPhoto(input: CreateEventPhotoInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const photo = await EventPhoto.create({
    event: input.event,
    url: input.url,
    caption: input.caption || undefined,
    uploadedBy: actor.id,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "event_photo.add",
    entityType: "EventPhoto",
    entityId: photo._id,
    school: actor.school,
  });

  return photo;
}

export async function deleteEventPhoto(id: string, actor: { id: string; school?: string }) {
  await connectDB();

  const photo = await EventPhoto.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!photo) throw ApiError.notFound("Photo not found");

  await photo.deleteOne();

  await ActivityLog.create({
    user: actor.id,
    action: "event_photo.delete",
    entityType: "EventPhoto",
    entityId: id,
    school: actor.school,
  });
}
