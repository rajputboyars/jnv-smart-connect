import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createSalaryStructureSchema } from "@/validators/hr.validator";
import { listSalaryStructures, createSalaryStructure } from "@/controllers/payroll.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.HR_MANAGE, async (req, _ctx, session) => {
    const teacher = req.nextUrl.searchParams.get("teacher") ?? undefined;
    const structures = await listSalaryStructures(session.school, teacher);
    return ok(structures);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HR_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createSalaryStructureSchema.parse(body);
    const structure = await createSalaryStructure(input, { id: session.sub, school: session.school });
    return ok({ id: structure._id.toString() }, { status: 201, message: "Salary structure created" });
  })
);
