import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withAuth } from "@/middlewares/with-auth";
import { updateProfileSchema } from "@/validators/user.validator";
import { updateOwnProfile } from "@/controllers/user.controller";
import { ok } from "@/lib/utils/api-response";

export const PATCH = withErrorHandling(
  withAuth(async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = updateProfileSchema.parse(body);
    const user = await updateOwnProfile(session.sub, input);
    return ok(user, { message: "Profile updated" });
  })
);
