import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateHostelBuildingSchema } from "@/validators/hostel.validator";
import { updateHostelBuilding, deleteHostelBuilding } from "@/controllers/hostel.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.HOSTEL_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateHostelBuildingSchema.parse(body);
    const building = await updateHostelBuilding(id, input, { id: session.sub, school: session.school });
    return ok({ id: building._id.toString() }, { message: "Building updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.HOSTEL_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await deleteHostelBuilding(id, { id: session.sub, school: session.school });
    return ok(result, { message: "Building removed" });
  })
);
