import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { deleteEventPhoto } from "@/controllers/event-photo.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string; photoId: string }> };

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.EVENTS_MANAGE, async (_req, ctx, session) => {
    const { photoId } = await ctx.params;
    await deleteEventPhoto(photoId, { id: session.sub, school: session.school });
    return ok(null, { message: "Photo removed" });
  })
);
