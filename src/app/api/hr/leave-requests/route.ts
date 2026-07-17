import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createStaffLeaveRequestSchema } from "@/validators/hr.validator";
import { listStaffLeaveRequests, createStaffLeaveRequest } from "@/controllers/staff-leave.controller";
import { ok } from "@/lib/utils/api-response";

const LEAVE_PERMISSIONS = [PERMISSIONS.HR_VIEW, PERMISSIONS.HR_MANAGE];

export const GET = withErrorHandling(
  withAnyPermission(LEAVE_PERMISSIONS, async (req, _ctx, session) => {
    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const requests = await listStaffLeaveRequests(session, status);
    return ok(requests);
  })
);

export const POST = withErrorHandling(
  withAnyPermission(LEAVE_PERMISSIONS, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createStaffLeaveRequestSchema.parse(body);
    const request = await createStaffLeaveRequest(input, session);
    return ok({ id: request._id.toString() }, { status: 201, message: "Leave request submitted" });
  })
);
