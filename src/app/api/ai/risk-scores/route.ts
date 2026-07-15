import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { getStudentRiskScores } from "@/controllers/ai.controller";
import { ok } from "@/lib/utils/api-response";

// Rule-based (not ML) risk scoring — see src/lib/ai/risk-scoring.ts and
// docs/ROADMAP.md for why this isn't marketed as a trained prediction model.
export const GET = withErrorHandling(
  withPermission(PERMISSIONS.AI_ASSIST_USE, async (_req, _ctx, session) => {
    const scores = await getStudentRiskScores(session);
    return ok(scores);
  })
);
