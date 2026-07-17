import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateTicketStatusSchema } from "@/validators/maintenance.validator";
import { updateTicketStatus } from "@/controllers/maintenance-ticket.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.MAINTENANCE_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateTicketStatusSchema.parse(body);
    const ticket = await updateTicketStatus(id, input, { id: session.sub, school: session.school });
    return ok({ id: ticket._id.toString(), status: ticket.status }, { message: "Ticket updated" });
  })
);
