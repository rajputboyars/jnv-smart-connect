import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { loginSchema } from "@/validators/auth.validator";
import { loginUser } from "@/controllers/auth.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const input = loginSchema.parse(body);

  const user = await loginUser(input, {
    ip: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return ok(user, { message: "Signed in successfully" });
});
