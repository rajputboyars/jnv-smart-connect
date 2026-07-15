import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { teacherQuerySchema, createTeacherSchema } from "@/validators/teacher.validator";
import { listTeachers, createTeacher } from "@/controllers/teacher.controller";
import { ok, paginated } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.TEACHERS_VIEW, async (req: NextRequest, _ctx, session) => {
    const query = teacherQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries())
    );
    const { items, total } = await listTeachers(query, session.school);
    return paginated(items, { page: query.page, limit: query.limit, total });
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.TEACHERS_CREATE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createTeacherSchema.parse(body);
    const teacher = await createTeacher(input, { id: session.sub, school: session.school });
    return ok({ id: teacher._id.toString() }, { status: 201, message: "Teacher added" });
  })
);
