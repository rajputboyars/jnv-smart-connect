import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createAcademicYearSchema } from "@/validators/academics.validator";
import { listAcademicYears, createAcademicYear } from "@/controllers/academic-year.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACADEMICS_MANAGE, async (_req, _ctx, session) => {
    const years = await listAcademicYears(session.school);
    return ok(years);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACADEMICS_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createAcademicYearSchema.parse(body);
    const year = await createAcademicYear(input, { id: session.sub, school: session.school });
    return ok({ id: year._id.toString() }, { status: 201, message: "Academic year created" });
  })
);
