import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { homeworkGeneratorSchema } from "@/validators/ai.validator";
import { generateHomework } from "@/controllers/ai.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.AI_ASSIST_USE, async (req) => {
    const body = await req.json();
    const input = homeworkGeneratorSchema.parse(body);
    const result = await generateHomework(input);
    return ok(result);
  })
);
