import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createLeaveRequestSchema } from "@/validators/hostel.validator";
import { listLeaveRequests, createLeaveRequest } from "@/controllers/leave-request.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_VIEW, async (req: NextRequest, _ctx, session) => {
    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const studentId = req.nextUrl.searchParams.get("studentId") ?? undefined;
    const requests = await listLeaveRequests(session, { status, studentId });
    return ok(requests);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_VIEW, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createLeaveRequestSchema.parse(body);
    const request = await createLeaveRequest(input, session);
    return ok({ id: request._id.toString() }, { status: 201, message: "Leave request submitted" });
  })
);
