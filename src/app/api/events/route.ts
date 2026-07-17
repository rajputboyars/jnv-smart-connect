import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createEventSchema } from "@/validators/event.validator";
import { listEvents, createEvent } from "@/controllers/event.controller";
import { ok } from "@/lib/utils/api-response";
import type { EventType } from "@/models/enums";

export const GET = withErrorHandling(
  withAnyPermission([PERMISSIONS.EVENTS_VIEW, PERMISSIONS.EVENTS_MANAGE], async (req, _ctx, session) => {
    const type = (req.nextUrl.searchParams.get("type") as EventType) || undefined;
    const events = await listEvents(session.school, type);
    return ok(events);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.EVENTS_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createEventSchema.parse(body);
    const event = await createEvent(input, { id: session.sub, school: session.school });
    return ok({ id: event._id.toString() }, { status: 201, message: "Event created" });
  })
);
