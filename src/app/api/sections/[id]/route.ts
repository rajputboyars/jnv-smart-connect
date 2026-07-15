import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateSectionSchema } from "@/validators/academics.validator";
import { updateSection, deleteSection } from "@/controllers/section.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACADEMICS_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateSectionSchema.parse(body);
    const section = await updateSection(id, input, { id: session.sub, school: session.school });
    return ok({ id: section._id.toString() }, { message: "Section updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACADEMICS_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await deleteSection(id, { id: session.sub, school: session.school });
    return ok(result, { message: "Section removed" });
  })
);
