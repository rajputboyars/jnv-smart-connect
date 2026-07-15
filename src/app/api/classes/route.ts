import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createClassSchema } from "@/validators/academics.validator";
import { listClasses, createClass } from "@/controllers/class.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACADEMICS_MANAGE, async (_req, _ctx, session) => {
    const classes = await listClasses(session.school);
    return ok(classes);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACADEMICS_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createClassSchema.parse(body);
    const cls = await createClass(input, { id: session.sub, school: session.school });
    return ok({ id: cls._id.toString() }, { status: 201, message: "Class created" });
  })
);
