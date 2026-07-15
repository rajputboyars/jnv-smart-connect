import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ROLES } from "@/types/roles";
import { ApiError } from "@/lib/utils/api-error";
import { connectDB } from "@/lib/db/connect";
import { Student } from "@/models/Student";
import { Parent } from "@/models/Parent";
import { getStudentAttendanceHistory } from "@/controllers/attendance.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ATTENDANCE_VIEW, async (req: NextRequest, _ctx, session) => {
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    let studentId = req.nextUrl.searchParams.get("studentId");

    if (!from || !to) {
      throw ApiError.badRequest("from and to dates are required");
    }

    await connectDB();

    if (session.role === ROLES.STUDENT) {
      const own = await Student.findOne({ user: session.sub }).select("_id");
      if (!own) throw ApiError.notFound("Your student profile hasn't been linked yet");
      studentId = own._id.toString();
    } else if (session.role === ROLES.PARENT) {
      if (!studentId) throw ApiError.badRequest("studentId is required");
      const parent = await Parent.findOne({ user: session.sub, children: studentId });
      if (!parent) throw ApiError.forbidden("This student isn't linked to your account");
    } else if (!studentId) {
      throw ApiError.badRequest("studentId is required");
    }

    const history = await getStudentAttendanceHistory(studentId as string, from, to, session.school);
    return ok(history);
  })
);
