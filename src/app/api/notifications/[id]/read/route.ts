import { withErrorHandling } from "@/middlewares/error-handler";
import { withAuth } from "@/middlewares/with-auth";
import { markNotificationRead } from "@/controllers/notification.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withAuth<Ctx>(async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await markNotificationRead(id, session.sub);
    return ok(result, { message: "Marked as read" });
  })
);
