import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/utils/api-error";
import { getClassAttendanceReport } from "@/controllers/attendance.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ATTENDANCE_MARK, async (req: NextRequest, _ctx, session) => {
    const classId = req.nextUrl.searchParams.get("classId");
    const sectionId = req.nextUrl.searchParams.get("sectionId");
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    if (!classId || !sectionId || !from || !to) {
      throw ApiError.badRequest("classId, sectionId, from and to are required");
    }

    const report = await getClassAttendanceReport(classId, sectionId, from, to, session.school);
    return ok(report);
  })
);
