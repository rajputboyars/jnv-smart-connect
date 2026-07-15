import type { NextRequest } from "next/server";
import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { issueBookSchema } from "@/validators/library.validator";
import { listBookIssues, issueBook } from "@/controllers/library.controller";
import { BOOK_ISSUE_STATUSES, type BookIssueStatus } from "@/models/enums";
import { ok } from "@/lib/utils/api-response";

function parseStatus(value: string | null): BookIssueStatus | undefined {
  return value && (BOOK_ISSUE_STATUSES as readonly string[]).includes(value)
    ? (value as BookIssueStatus)
    : undefined;
}

// Staff-only: reveals every student's borrowing history, so broader
// LIBRARY_VIEW holders (parents/students/teachers) must not see this list.
export const GET = withErrorHandling(
  withPermission(PERMISSIONS.LIBRARY_MANAGE, async (req: NextRequest, _ctx, session) => {
    const status = parseStatus(req.nextUrl.searchParams.get("status"));
    const issues = await listBookIssues(session.school, status);
    return ok(issues);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.LIBRARY_MANAGE, async (req: NextRequest, _ctx, session) => {
    const body = await req.json();
    const input = issueBookSchema.parse(body);
    const issue = await issueBook(input, { id: session.sub, school: session.school });
    return ok({ id: issue._id.toString() }, { status: 201, message: "Book issued" });
  })
);
