import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { returnBookSchema } from "@/validators/library.validator";
import { returnBook } from "@/controllers/library.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.LIBRARY_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = returnBookSchema.parse(body);
    const issue = await returnBook(id, input.finePaid, { id: session.sub, school: session.school });
    return ok(
      { id: issue._id.toString(), fineAmount: issue.fineAmount },
      { message: issue.fineAmount > 0 ? `Returned. Fine: ₹${issue.fineAmount}` : "Book returned" }
    );
  })
);
