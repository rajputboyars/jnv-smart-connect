import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createSectionSchema } from "@/validators/academics.validator";
import { listSections, createSection } from "@/controllers/section.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACADEMICS_MANAGE, async (_req, _ctx, session) => {
    const sections = await listSections(session.school);
    return ok(sections);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACADEMICS_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createSectionSchema.parse(body);
    const section = await createSection(input, { id: session.sub, school: session.school });
    return ok({ id: section._id.toString() }, { status: 201, message: "Section created" });
  })
);
