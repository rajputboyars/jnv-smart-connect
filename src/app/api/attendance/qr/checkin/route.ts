import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withAuth } from "@/middlewares/with-auth";
import { ApiError } from "@/lib/utils/api-error";
import { checkInWithQrToken } from "@/controllers/attendance.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withAuth(async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token : null;
    if (!token) throw ApiError.badRequest("Missing attendance code");

    const result = await checkInWithQrToken(token, session);
    return ok(result, { message: result.message });
  })
);
