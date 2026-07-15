import type { NextRequest } from "next/server";
import QRCode from "qrcode";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createQrSessionSchema } from "@/validators/attendance.validator";
import { createQrAttendanceSession } from "@/controllers/attendance.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ATTENDANCE_MARK, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = createQrSessionSchema.parse(body);

    const result = await createQrAttendanceSession(input, {
      id: session.sub,
      school: session.school,
    });

    const checkinUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard/attendance/checkin/${result.token}`;
    const qrDataUrl = await QRCode.toDataURL(checkinUrl, { margin: 1, width: 320 });

    return ok(
      { ...result, checkinUrl, qrDataUrl },
      { status: 201, message: "QR attendance session created" }
    );
  })
);
