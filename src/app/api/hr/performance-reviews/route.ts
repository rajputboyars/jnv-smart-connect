import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { ApiError } from "@/lib/utils/api-error";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createPerformanceReviewSchema } from "@/validators/hr.validator";
import { listPerformanceReviews, createPerformanceReview } from "@/controllers/employee-record.controller";
import { ok } from "@/lib/utils/api-response";

const HR_PERMISSIONS = [PERMISSIONS.HR_VIEW, PERMISSIONS.HR_MANAGE];

export const GET = withErrorHandling(
  withAnyPermission(HR_PERMISSIONS, async (req, _ctx, session) => {
    const teacher = req.nextUrl.searchParams.get("teacher");
    if (!teacher) throw ApiError.badRequest("teacher is required");
    const reviews = await listPerformanceReviews(teacher, session);
    return ok(reviews);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HR_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createPerformanceReviewSchema.parse(body);
    const review = await createPerformanceReview(input, { id: session.sub, school: session.school });
    return ok({ id: review._id.toString() }, { status: 201, message: "Performance review recorded" });
  })
);
