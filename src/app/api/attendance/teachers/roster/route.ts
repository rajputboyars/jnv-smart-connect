import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/utils/api-error";
import { getTeacherRosterForAttendance } from "@/controllers/attendance.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.STAFF_ATTENDANCE_MARK, async (req: NextRequest, _ctx, session) => {
    const date = req.nextUrl.searchParams.get("date");
    if (!date) throw ApiError.badRequest("date is required");

    const roster = await getTeacherRosterForAttendance(date, session.school);
    return ok(roster);
  })
);
