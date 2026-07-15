import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createMedicineLogSchema } from "@/validators/health.validator";
import { createMedicineLog } from "@/controllers/health.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HEALTH_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createMedicineLogSchema.parse(body);
    const log = await createMedicineLog(input, { id: session.sub, school: session.school });
    return ok({ id: log._id.toString() }, { status: 201, message: "Medicine log recorded" });
  })
);
