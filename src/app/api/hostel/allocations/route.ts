import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createAllocationSchema } from "@/validators/hostel.validator";
import { listHostelAllocations, allocateBed } from "@/controllers/hostel.controller";
import { ok } from "@/lib/utils/api-response";

// Full roster is staff-only (HOSTEL_MANAGE) — it reveals every student's room
// assignment, so broader HOSTEL_VIEW holders (parents/students) must not see
// this list. They get their own allocation via /api/hostel/my-allocation.
export const GET = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_MANAGE, async (_req, _ctx, session) => {
    const allocations = await listHostelAllocations(session.school);
    return ok(allocations);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createAllocationSchema.parse(body);
    const allocation = await allocateBed(input, { id: session.sub, school: session.school });
    return ok({ id: allocation._id.toString() }, { status: 201, message: "Bed allocated" });
  })
);
