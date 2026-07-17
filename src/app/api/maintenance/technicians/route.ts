import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createTechnicianSchema } from "@/validators/maintenance.validator";
import { listTechnicians, createTechnician } from "@/controllers/technician.controller";
import { ok } from "@/lib/utils/api-response";
import type { MaintenanceCategory } from "@/models/enums";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.MAINTENANCE_MANAGE, async (req, _ctx, session) => {
    const specialization = (req.nextUrl.searchParams.get("specialization") as MaintenanceCategory) || undefined;
    const technicians = await listTechnicians(session.school, specialization);
    return ok(technicians);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.MAINTENANCE_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createTechnicianSchema.parse(body);
    const technician = await createTechnician(input, { id: session.sub, school: session.school });
    return ok({ id: technician._id.toString() }, { status: 201, message: "Technician added" });
  })
);
