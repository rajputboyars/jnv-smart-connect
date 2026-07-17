import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createScholarshipSchema } from "@/validators/finance.validator";
import { listScholarships, createScholarship } from "@/controllers/scholarship.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (_req, _ctx, session) => {
    const scholarships = await listScholarships(session.school);
    return ok(scholarships);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createScholarshipSchema.parse(body);
    const scholarship = await createScholarship(input, { id: session.sub, school: session.school });
    return ok({ id: scholarship._id.toString() }, { status: 201, message: "Scholarship created" });
  })
);
