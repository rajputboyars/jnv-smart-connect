import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateAcademicYearSchema } from "@/validators/academics.validator";
import { updateAcademicYear, deleteAcademicYear } from "@/controllers/academic-year.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACADEMICS_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateAcademicYearSchema.parse(body);
    const year = await updateAcademicYear(id, input, { id: session.sub, school: session.school });
    return ok({ id: year._id.toString() }, { message: "Academic year updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACADEMICS_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await deleteAcademicYear(id, { id: session.sub, school: session.school });
    return ok(result, { message: "Academic year removed" });
  })
);
