import { connectDB } from "@/lib/db/connect";
import { Certificate } from "@/models/Certificate";
import { EventParticipant } from "@/models/EventParticipant";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import type { IssueCertificateInput } from "@/validators/event.validator";

export async function listCertificates(eventId: string, school?: string) {
  await connectDB();
  return Certificate.find({ event: eventId, ...(school ? { school } : {}) })
    .sort({ issuedAt: -1 })
    .populate({ path: "participant", populate: { path: "student", select: "name admissionNumber" } })
    .populate("event", "title startDate")
    .populate("issuedBy", "name")
    .lean();
}

export async function issueCertificate(input: IssueCertificateInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const participant = await EventParticipant.findOne({
    _id: input.participant,
    event: input.event,
    school: actor.school,
  });
  if (!participant) throw ApiError.badRequest("Participant not found for this event");

  const existing = await Certificate.findOne({ event: input.event, participant: input.participant });
  if (existing) throw ApiError.conflict("A certificate has already been issued to this participant");

  const certificate = await Certificate.create({
    event: input.event,
    participant: input.participant,
    title: input.title,
    issuedBy: actor.id,
    issuedAt: new Date(),
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "certificate.issue",
    entityType: "Certificate",
    entityId: certificate._id,
    school: actor.school,
  });

  return certificate;
}
