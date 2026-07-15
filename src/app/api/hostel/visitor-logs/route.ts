import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createVisitorLogSchema } from "@/validators/hostel.validator";
import { listVisitorLogs, createVisitorLog } from "@/controllers/visitor-log.controller";
import { ok } from "@/lib/utils/api-response";

// Staff-only: reveals every student's visitor activity, so broader
// HOSTEL_VIEW holders (parents/students) must not see this list.
export const GET = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_MANAGE, async (_req, _ctx, session) => {
    const logs = await listVisitorLogs(session.school);
    return ok(logs);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createVisitorLogSchema.parse(body);
    const log = await createVisitorLog(input, { id: session.sub, school: session.school });
    return ok({ id: log._id.toString() }, { status: 201, message: "Visitor logged" });
  })
);
