import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createMaintenanceTicketSchema } from "@/validators/maintenance.validator";
import { listMaintenanceTickets, createMaintenanceTicket } from "@/controllers/maintenance-ticket.controller";
import { ok } from "@/lib/utils/api-response";

const TICKET_PERMISSIONS = [PERMISSIONS.MAINTENANCE_VIEW, PERMISSIONS.MAINTENANCE_MANAGE];

export const GET = withErrorHandling(
  withAnyPermission(TICKET_PERMISSIONS, async (req, _ctx, session) => {
    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const category = req.nextUrl.searchParams.get("category") ?? undefined;
    const tickets = await listMaintenanceTickets(session, { status, category });
    return ok(tickets);
  })
);

export const POST = withErrorHandling(
  withAnyPermission(TICKET_PERMISSIONS, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createMaintenanceTicketSchema.parse(body);
    const ticket = await createMaintenanceTicket(input, session);
    return ok({ id: ticket._id.toString() }, { status: 201, message: "Ticket submitted" });
  })
);
