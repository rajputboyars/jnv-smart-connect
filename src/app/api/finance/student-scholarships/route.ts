import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { assignScholarshipSchema } from "@/validators/finance.validator";
import { listStudentScholarships, assignScholarship } from "@/controllers/scholarship.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const studentId = req.nextUrl.searchParams.get("studentId") ?? undefined;
    const assignments = await listStudentScholarships(session.school, studentId);
    return ok(assignments);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = assignScholarshipSchema.parse(body);
    const assignment = await assignScholarship(input, { id: session.sub, school: session.school });
    return ok({ id: assignment._id.toString() }, { status: 201, message: "Scholarship assigned" });
  })
);
