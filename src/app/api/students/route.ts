import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { studentQuerySchema, createStudentSchema } from "@/validators/student.validator";
import { listStudents, createStudent } from "@/controllers/student.controller";
import { ok, paginated } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.STUDENTS_VIEW, async (req: NextRequest, _ctx, session) => {
    const query = studentQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries())
    );
    const { items, total } = await listStudents(query, session.school);
    return paginated(items, { page: query.page, limit: query.limit, total });
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.STUDENTS_CREATE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createStudentSchema.parse(body);
    const student = await createStudent(input, { id: session.sub, school: session.school });
    return ok({ id: student._id.toString() }, { status: 201, message: "Student added" });
  })
);
