import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateStudentSchema } from "@/validators/student.validator";
import { getStudentById, updateStudent, deleteStudent } from "@/controllers/student.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.STUDENTS_VIEW, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const student = await getStudentById(id, session.school);
    return ok(student);
  })
);

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.STUDENTS_UPDATE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateStudentSchema.parse(body);
    const student = await updateStudent(id, input, { id: session.sub, school: session.school });
    return ok({ id: student._id.toString() }, { message: "Student updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.STUDENTS_DELETE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await deleteStudent(id, { id: session.sub, school: session.school });
    return ok(result, { message: "Student removed" });
  })
);
