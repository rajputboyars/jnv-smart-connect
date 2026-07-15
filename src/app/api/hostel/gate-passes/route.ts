import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createGatePassSchema } from "@/validators/hostel.validator";
import { listGatePasses, issueGatePass } from "@/controllers/gate-pass.controller";
import { GATE_PASS_STATUSES, type GatePassStatus } from "@/models/enums";
import { ok } from "@/lib/utils/api-response";

function parseStatus(value: string | null): GatePassStatus | undefined {
  return value && (GATE_PASS_STATUSES as readonly string[]).includes(value)
    ? (value as GatePassStatus)
    : undefined;
}

// Staff-only: reveals every student's gate pass activity, so broader
// HOSTEL_VIEW holders (parents/students) must not see this list.
export const GET = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_MANAGE, async (req: NextRequest, _ctx, session) => {
    const status = parseStatus(req.nextUrl.searchParams.get("status"));
    const passes = await listGatePasses(session.school, status);
    return ok(passes);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createGatePassSchema.parse(body);
    const pass = await issueGatePass(input, { id: session.sub, school: session.school });
    return ok({ id: pass._id.toString() }, { status: 201, message: "Gate pass issued" });
  })
);
