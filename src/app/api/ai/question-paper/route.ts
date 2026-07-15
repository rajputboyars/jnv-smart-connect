import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { questionPaperSchema } from "@/validators/ai.validator";
import { generateQuestionPaper } from "@/controllers/ai.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.AI_ASSIST_USE, async (req) => {
    const body = await req.json();
    const input = questionPaperSchema.parse(body);
    const result = await generateQuestionPaper(input);
    return ok(result);
  })
);
