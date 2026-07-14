import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withAuth } from "@/middlewares/with-auth";
import { changePasswordSchema } from "@/validators/user.validator";
import { changeOwnPassword } from "@/controllers/user.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withAuth(async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = changePasswordSchema.parse(body);
    const result = await changeOwnPassword(session.sub, input);
    return ok(null, { message: result.message });
  })
);
