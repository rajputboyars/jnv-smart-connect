import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { registerSchema } from "@/validators/auth.validator";
import { registerStaffAccount } from "@/controllers/auth.controller";
import { ok } from "@/lib/utils/api-response";

// Restricted: only accounts with USERS_MANAGE (Super Admin / Principal) may
// provision new staff logins. There is no public self-signup in a school ERP.
export const POST = withErrorHandling(
  withPermission(PERMISSIONS.USERS_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = registerSchema.parse(body);
    const user = await registerStaffAccount(input, { id: session.sub, school: session.school });
    return ok(user, { status: 201, message: "Account created" });
  })
);
