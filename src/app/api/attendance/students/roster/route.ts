import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/utils/api-error";
import { getClassRosterForAttendance } from "@/controllers/attendance.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ATTENDANCE_MARK, async (req: NextRequest, _ctx, session) => {
    const classId = req.nextUrl.searchParams.get("classId");
    const sectionId = req.nextUrl.searchParams.get("sectionId");
    const date = req.nextUrl.searchParams.get("date");

    if (!classId || !sectionId || !date) {
      throw ApiError.badRequest("classId, sectionId and date are required");
    }

    const roster = await getClassRosterForAttendance(classId, sectionId, date, session.school);
    return ok(roster);
  })
);
