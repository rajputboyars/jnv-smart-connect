import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createEventParticipantSchema } from "@/validators/event.validator";
import { listEventParticipants, addEventParticipant } from "@/controllers/event-participant.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Ctx>(
  withAnyPermission<Ctx>([PERMISSIONS.EVENTS_VIEW, PERMISSIONS.EVENTS_MANAGE], async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const participants = await listEventParticipants(id, session.school);
    return ok(participants);
  })
);

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.EVENTS_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = createEventParticipantSchema.parse({ ...body, event: id });
    const participant = await addEventParticipant(input, { id: session.sub, school: session.school });
    return ok({ id: participant._id.toString() }, { status: 201, message: "Participant added" });
  })
);
