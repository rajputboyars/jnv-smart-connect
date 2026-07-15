import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/utils/api-error";
import { getHostelRosterForAttendance } from "@/controllers/hostel-attendance.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_MANAGE, async (req: NextRequest, _ctx, session) => {
    const buildingId = req.nextUrl.searchParams.get("buildingId");
    const date = req.nextUrl.searchParams.get("date");
    if (!buildingId || !date) throw ApiError.badRequest("buildingId and date are required");

    const roster = await getHostelRosterForAttendance(buildingId, date, session.school);
    return ok(roster);
  })
);
