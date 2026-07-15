import { withErrorHandling } from "@/middlewares/error-handler";
import { withAuth } from "@/middlewares/with-auth";
import { listClassesWithSections } from "@/controllers/academics.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAuth(async (_req, _ctx, session) => {
    const classes = await listClassesWithSections(session.school);
    return ok(classes);
  })
);
