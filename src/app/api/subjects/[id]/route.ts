import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateSubjectSchema } from "@/validators/academics.validator";
import { updateSubject, deleteSubject } from "@/controllers/subject.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACADEMICS_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateSubjectSchema.parse(body);
    const subject = await updateSubject(id, input, { id: session.sub, school: session.school });
    return ok({ id: subject._id.toString() }, { message: "Subject updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACADEMICS_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await deleteSubject(id, { id: session.sub, school: session.school });
    return ok(result, { message: "Subject removed" });
  })
);
