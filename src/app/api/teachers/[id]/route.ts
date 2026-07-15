import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateTeacherSchema } from "@/validators/teacher.validator";
import { getTeacherById, updateTeacher, deleteTeacher } from "@/controllers/teacher.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.TEACHERS_VIEW, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const teacher = await getTeacherById(id, session.school);
    return ok(teacher);
  })
);

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.TEACHERS_UPDATE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateTeacherSchema.parse(body);
    const teacher = await updateTeacher(id, input, { id: session.sub, school: session.school });
    return ok({ id: teacher._id.toString() }, { message: "Teacher updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.TEACHERS_DELETE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await deleteTeacher(id, { id: session.sub, school: session.school });
    return ok(result, { message: "Teacher removed" });
  })
);
