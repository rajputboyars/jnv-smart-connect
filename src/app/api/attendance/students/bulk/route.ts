import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { bulkStudentAttendanceSchema } from "@/validators/attendance.validator";
import { bulkMarkStudentAttendance } from "@/controllers/attendance.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ATTENDANCE_MARK, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = bulkStudentAttendanceSchema.parse(body);
    const result = await bulkMarkStudentAttendance(input, { id: session.sub, school: session.school });
    return ok(result, { message: `Attendance saved for ${result.marked} students` });
  })
);
