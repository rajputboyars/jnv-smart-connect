import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { reviewStaffLeaveRequestSchema } from "@/validators/hr.validator";
import { reviewStaffLeaveRequest } from "@/controllers/staff-leave.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.HR_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = reviewStaffLeaveRequestSchema.parse(body);
    const request = await reviewStaffLeaveRequest(id, input, { id: session.sub, school: session.school });
    return ok({ id: request._id.toString(), status: request.status }, { message: "Leave request updated" });
  })
);
