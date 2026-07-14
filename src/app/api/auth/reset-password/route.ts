import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { resetPasswordSchema } from "@/validators/auth.validator";
import { resetPassword } from "@/controllers/auth.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const input = resetPasswordSchema.parse(body);
  const result = await resetPassword(input);
  return ok(null, { message: result.message });
});
