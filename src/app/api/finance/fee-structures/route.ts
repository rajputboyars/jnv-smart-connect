import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createFeeStructureSchema } from "@/validators/finance.validator";
import { listFeeStructures, createFeeStructure } from "@/controllers/fee-structure.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const academicYear = req.nextUrl.searchParams.get("academicYear") ?? undefined;
    const structures = await listFeeStructures(session.school, academicYear);
    return ok(structures);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createFeeStructureSchema.parse(body);
    const structure = await createFeeStructure(input, { id: session.sub, school: session.school });
    return ok({ id: structure._id.toString() }, { status: 201, message: "Fee structure created" });
  })
);
