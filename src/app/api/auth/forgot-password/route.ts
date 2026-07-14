import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { forgotPasswordSchema } from "@/validators/auth.validator";
import { requestPasswordReset } from "@/controllers/auth.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const input = forgotPasswordSchema.parse(body);
  const result = await requestPasswordReset(input);
  return ok(null, { message: result.message });
});
