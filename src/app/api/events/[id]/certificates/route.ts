import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { issueCertificateSchema } from "@/validators/event.validator";
import { listCertificates, issueCertificate } from "@/controllers/certificate.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Ctx>(
  withAnyPermission<Ctx>([PERMISSIONS.EVENTS_VIEW, PERMISSIONS.EVENTS_MANAGE], async (_req, ctx, session) => {
    const { id } = await ctx.params;
    const certificates = await listCertificates(id, session.school);
    return ok(certificates);
  })
);

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.EVENTS_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = issueCertificateSchema.parse({ ...body, event: id });
    const certificate = await issueCertificate(input, { id: session.sub, school: session.school });
    return ok({ id: certificate._id.toString() }, { status: 201, message: "Certificate issued" });
  })
);
