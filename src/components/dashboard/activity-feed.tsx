import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ActivityItem } from "@/services/dashboard.service";

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "signed in",
  "auth.logout": "signed out",
  "auth.register": "created a new account",
  "auth.password_reset": "reset their password",
  "student.create": "added a student",
  "student.update": "updated a student",
  "student.delete": "removed a student",
  "teacher.create": "added a teacher",
  "teacher.update": "updated a teacher",
  "teacher.delete": "removed a teacher",
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4" /> Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 text-sm">
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-medium">{item.user?.name ?? "Someone"}</strong>{" "}
              {ACTION_LABELS[item.action] ?? item.action}
            </span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {formatDate(item.createdAt)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
