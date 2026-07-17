import { connectDB } from "@/lib/db/connect";
import { EventParticipant } from "@/models/EventParticipant";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { assertStudentInSchool } from "@/lib/auth/student-scope";
import type { CreateEventParticipantInput } from "@/validators/event.validator";

export async function listEventParticipants(eventId: string, school?: string) {
  await connectDB();
  return EventParticipant.find({ event: eventId, ...(school ? { school } : {}) })
    .sort({ createdAt: -1 })
    .populate("student", "name admissionNumber currentClass section")
    .lean();
}

export async function addEventParticipant(
  input: CreateEventParticipantInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  await assertStudentInSchool(input.student, actor.school);

  const existing = await EventParticipant.findOne({ event: input.event, student: input.student });
  if (existing) throw ApiError.conflict("This student is already recorded as a participant for this event");

  const participant = await EventParticipant.create({
    event: input.event,
    student: input.student,
    role: input.role,
    position: input.position || undefined,
    remarks: input.remarks || undefined,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "event_participant.add",
    entityType: "EventParticipant",
    entityId: participant._id,
    school: actor.school,
  });

  return participant;
}
