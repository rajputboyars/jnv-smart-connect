import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateClassSchema } from "@/validators/academics.validator";
import { updateClass, deleteClass } from "@/controllers/class.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACADEMICS_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateClassSchema.parse(body);
    const cls = await updateClass(id, input, { id: session.sub, school: session.school });
    return ok({ id: cls._id.toString() }, { message: "Class updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACADEMICS_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await deleteClass(id, { id: session.sub, school: session.school });
    return ok(result, { message: "Class removed" });
  })
);
