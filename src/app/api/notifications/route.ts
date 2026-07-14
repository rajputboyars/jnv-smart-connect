import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withAuth, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createNotificationSchema } from "@/validators/notification.validator";
import { listNotificationsForUser, createNotification } from "@/controllers/notification.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAuth(async (req: NextRequest, _ctx, session) => {
    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);

    const { items, total, unreadCount } = await listNotificationsForUser(session, {
      page,
      limit,
    });

    return ok({ items, total, unreadCount, page, limit });
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.NOTIFICATIONS_SEND, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createNotificationSchema.parse(body);
    const result = await createNotification(input, session);
    return ok(result, { status: 201, message: "Notification sent" });
  })
);
