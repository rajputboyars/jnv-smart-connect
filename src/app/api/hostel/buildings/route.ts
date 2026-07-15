import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createHostelBuildingSchema } from "@/validators/hostel.validator";
import { listHostelBuildings, createHostelBuilding } from "@/controllers/hostel.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_VIEW, async (_req, _ctx, session) => {
    const buildings = await listHostelBuildings(session.school);
    return ok(buildings);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createHostelBuildingSchema.parse(body);
    const building = await createHostelBuilding(input, { id: session.sub, school: session.school });
    return ok({ id: building._id.toString() }, { status: 201, message: "Hostel building created" });
  })
);
