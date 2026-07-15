import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createSubjectSchema } from "@/validators/academics.validator";
import { listSubjectsFull, createSubject } from "@/controllers/subject.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACADEMICS_MANAGE, async (_req, _ctx, session) => {
    const subjects = await listSubjectsFull(session.school);
    return ok(subjects);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACADEMICS_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createSubjectSchema.parse(body);
    const subject = await createSubject(input, { id: session.sub, school: session.school });
    return ok({ id: subject._id.toString() }, { status: 201, message: "Subject created" });
  })
);
