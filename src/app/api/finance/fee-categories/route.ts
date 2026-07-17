import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createFeeCategorySchema } from "@/validators/finance.validator";
import { listFeeCategories, createFeeCategory } from "@/controllers/fee-structure.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (_req, _ctx, session) => {
    const categories = await listFeeCategories(session.school);
    return ok(categories);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createFeeCategorySchema.parse(body);
    const category = await createFeeCategory(input, { id: session.sub, school: session.school });
    return ok({ id: category._id.toString() }, { status: 201, message: "Fee category created" });
  })
);
