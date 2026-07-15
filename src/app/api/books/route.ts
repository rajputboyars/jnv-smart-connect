import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { bookQuerySchema, createBookSchema } from "@/validators/library.validator";
import { listBooks, createBook } from "@/controllers/library.controller";
import { ok, paginated } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.LIBRARY_VIEW, async (req: NextRequest, _ctx, session) => {
    const query = bookQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams.entries()));
    const { items, total } = await listBooks(query, session.school);
    return paginated(items, { page: query.page, limit: query.limit, total });
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.LIBRARY_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createBookSchema.parse(body);
    const book = await createBook(input, { id: session.sub, school: session.school });
    return ok({ id: book._id.toString() }, { status: 201, message: "Book added" });
  })
);
