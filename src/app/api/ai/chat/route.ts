import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { chatSchema } from "@/validators/ai.validator";
import { chatWithAssistant } from "@/controllers/ai.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.AI_ASSIST_USE, async (req) => {
    const body = await req.json();
    const input = chatSchema.parse(body);
    const result = await chatWithAssistant(input.message, input.history ?? []);
    return ok(result);
  })
);
