import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createDoctorVisitSchema } from "@/validators/health.validator";
import { createDoctorVisit } from "@/controllers/health.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HEALTH_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createDoctorVisitSchema.parse(body);
    const visit = await createDoctorVisit(input, { id: session.sub, school: session.school });
    return ok({ id: visit._id.toString() }, { status: 201, message: "Doctor visit recorded" });
  })
);
