import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { NoticeItem } from "@/services/dashboard.service";

const TYPE_VARIANT: Record<NoticeItem["type"], "default" | "success" | "warning" | "destructive"> = {
  info: "default",
  success: "success",
  warning: "warning",
  urgent: "destructive",
};

export function NoticeList({ notices }: { notices: NoticeItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4" /> Recent notices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notices.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No notices yet.</p>
        )}
        {notices.map((notice) => (
          <div key={notice.id} className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-medium">{notice.title}</p>
              <p className="text-xs text-muted-foreground">
                {notice.sender?.name ?? "System"} &middot; {formatDate(notice.createdAt)}
              </p>
            </div>
            <Badge variant={TYPE_VARIANT[notice.type]}>{notice.type}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
