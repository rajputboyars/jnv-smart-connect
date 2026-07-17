import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createEventPhotoSchema } from "@/validators/event.validator";
import { listEventPhotos, addEventPhoto } from "@/controllers/event-photo.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Ctx>(
  withAnyPermission<Ctx>([PERMISSIONS.EVENTS_VIEW, PERMISSIONS.EVENTS_MANAGE], async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const photos = await listEventPhotos(id, session.school);
    return ok(photos);
  })
);

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.EVENTS_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = createEventPhotoSchema.parse({ ...body, event: id });
    const photo = await addEventPhoto(input, { id: session.sub, school: session.school });
    return ok({ id: photo._id.toString() }, { status: 201, message: "Photo added" });
  })
);
