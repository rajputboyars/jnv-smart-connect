import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { loginSchema } from "@/validators/auth.validator";
import { loginUser } from "@/controllers/auth.controller";
import { ok } from "@/lib/utils/api-response";
import { getClientIp } from "@/lib/security/rate-limit";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const input = loginSchema.parse(body);

  const user = await loginUser(input, {
    ip: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return ok(user, { message: "Signed in successfully" });
});
