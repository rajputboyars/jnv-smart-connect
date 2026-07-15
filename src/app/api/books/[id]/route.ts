import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateBookSchema } from "@/validators/library.validator";
import { getBookById, updateBook, deleteBook } from "@/controllers/library.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.LIBRARY_VIEW, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const book = await getBookById(id, session.school);
    return ok(book);
  })
);

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.LIBRARY_MANAGE, async (req: NextRequest, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateBookSchema.parse(body);
    const book = await updateBook(id, input, { id: session.sub, school: session.school });
    return ok({ id: book._id.toString() }, { message: "Book updated" });
  })
);

export const DELETE = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.LIBRARY_MANAGE, async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const result = await deleteBook(id, { id: session.sub, school: session.school });
    return ok(result, { message: "Book removed" });
  })
);
