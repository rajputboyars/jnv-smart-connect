import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createHostelRoomSchema } from "@/validators/hostel.validator";
import { listHostelRooms, createHostelRoom } from "@/controllers/hostel.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_VIEW, async (_req, _ctx, session) => {
    const rooms = await listHostelRooms(session.school);
    return ok(rooms);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createHostelRoomSchema.parse(body);
    const room = await createHostelRoom(input, { id: session.sub, school: session.school });
    return ok({ id: room._id.toString() }, { status: 201, message: "Room created" });
  })
);
