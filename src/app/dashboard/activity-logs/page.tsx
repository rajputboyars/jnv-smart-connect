import Link from "next/link";
import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { connectDB } from "@/lib/db/connect";
import { ActivityLog } from "@/models/ActivityLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 20;

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requirePermission(PERMISSIONS.ACTIVITY_LOGS_VIEW);
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));

  await connectDB();

  const filter = session.school ? { school: session.school } : {};
  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("user", "name role")
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Activity logs</h1>
        <p className="text-sm text-muted-foreground">A trail of important actions across your school.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {total} event{total === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow key={log._id.toString()}>
                  <TableCell className="font-medium">
                    {(log.user as unknown as { name?: string } | null)?.name ?? "System"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.action}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild disabled={page <= 1}>
            <Link href={`/dashboard/activity-logs?page=${Math.max(1, page - 1)}`}>Previous</Link>
          </Button>
          <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
            <Link href={`/dashboard/activity-logs?page=${Math.min(totalPages, page + 1)}`}>Next</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
