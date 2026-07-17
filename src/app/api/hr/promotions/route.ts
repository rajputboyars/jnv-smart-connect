import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { ApiError } from "@/lib/utils/api-error";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createPromotionHistorySchema } from "@/validators/hr.validator";
import { listPromotionHistory, createPromotionHistory } from "@/controllers/employee-record.controller";
import { ok } from "@/lib/utils/api-response";

const HR_PERMISSIONS = [PERMISSIONS.HR_VIEW, PERMISSIONS.HR_MANAGE];

export const GET = withErrorHandling(
  withAnyPermission(HR_PERMISSIONS, async (req, _ctx, session) => {
    const teacher = req.nextUrl.searchParams.get("teacher");
    if (!teacher) throw ApiError.badRequest("teacher is required");
    const promotions = await listPromotionHistory(teacher, session);
    return ok(promotions);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HR_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createPromotionHistorySchema.parse(body);
    const promotion = await createPromotionHistory(input, { id: session.sub, school: session.school });
    return ok({ id: promotion._id.toString() }, { status: 201, message: "Promotion recorded" });
  })
);
