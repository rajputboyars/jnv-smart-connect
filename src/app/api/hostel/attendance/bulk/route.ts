import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { bulkHostelAttendanceSchema } from "@/validators/hostel.validator";
import { bulkMarkHostelAttendance } from "@/controllers/hostel-attendance.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = bulkHostelAttendanceSchema.parse(body);
    const result = await bulkMarkHostelAttendance(input, { id: session.sub, school: session.school });
    return ok(result, { message: `Night attendance saved for ${result.marked} students` });
  })
);
