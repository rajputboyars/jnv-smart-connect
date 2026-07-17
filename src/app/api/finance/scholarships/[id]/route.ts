import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateScholarshipSchema } from "@/validators/finance.validator";
import { updateScholarship } from "@/controllers/scholarship.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateScholarshipSchema.parse(body);
    const scholarship = await updateScholarship(id, input, { id: session.sub, school: session.school });
    return ok({ id: scholarship._id.toString() }, { message: "Scholarship updated" });
  })
);
