import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { parentSummarySchema } from "@/validators/ai.validator";
import { generateParentSummary } from "@/controllers/ai.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.AI_ASSIST_USE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = parentSummarySchema.parse(body);
    const result = await generateParentSummary(input.studentId, session);
    return ok(result);
  })
);
