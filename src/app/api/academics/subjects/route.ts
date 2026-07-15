import { withErrorHandling } from "@/middlewares/error-handler";
import { withAuth } from "@/middlewares/with-auth";
import { listSubjects } from "@/controllers/academics.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAuth(async (_req, _ctx, session) => {
    const subjects = await listSubjects(session.school);
    return ok(subjects);
  })
);
