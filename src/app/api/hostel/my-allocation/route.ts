import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { getMyHostelAllocation } from "@/controllers/hostel.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.HOSTEL_VIEW, async (req: NextRequest, _ctx, session) => {
    const studentId = req.nextUrl.searchParams.get("studentId") ?? undefined;
    const allocation = await getMyHostelAllocation(session, studentId);
    return ok(allocation);
  })
);
