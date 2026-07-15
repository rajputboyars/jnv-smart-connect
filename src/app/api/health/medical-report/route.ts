import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ROLES } from "@/types/roles";
import { ApiError } from "@/lib/utils/api-error";
import { connectDB } from "@/lib/db/connect";
import { Student } from "@/models/Student";
import { getStudentMedicalReport } from "@/controllers/health.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.HEALTH_VIEW, async (req: NextRequest, _ctx, session) => {
    let studentId = req.nextUrl.searchParams.get("studentId");

    await connectDB();

    if (session.role === ROLES.STUDENT) {
      const own = await Student.findOne({ user: session.sub }).select("_id");
      if (!own) throw ApiError.notFound("Your student profile hasn't been linked yet");
      studentId = own._id.toString();
    } else if (!studentId) {
      throw ApiError.badRequest("studentId is required");
    }

    const report = await getStudentMedicalReport(studentId as string, session);
    return ok(report);
  })
);
