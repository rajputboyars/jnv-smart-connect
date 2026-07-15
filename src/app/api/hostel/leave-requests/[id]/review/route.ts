import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { reviewLeaveRequestSchema } from "@/validators/hostel.validator";
import { reviewLeaveRequest } from "@/controllers/leave-request.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.HOSTEL_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = reviewLeaveRequestSchema.parse(body);
    const request = await reviewLeaveRequest(id, input, { id: session.sub, school: session.school });
    return ok({ id: request._id.toString() }, { message: `Leave request ${input.status}` });
  })
);
