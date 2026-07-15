"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markNotificationReadRequest } from "@/services/notification.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import type { NotificationItem } from "@/services/notification.service";

const TYPE_VARIANT: Record<NotificationItem["type"], "default" | "success" | "warning" | "destructive"> = {
  info: "default",
  success: "success",
  warning: "warning",
  urgent: "destructive",
};

export function NotificationFeed() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "feed"],
    queryFn: () => fetchNotifications(1, 50),
  });

  const markRead = useMutation({
    mutationFn: markNotificationReadRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No notifications yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data.items.map((item) => (
        <Card
          key={item.id}
          className={cn(!item.isRead && "border-primary/30")}
          onClick={() => !item.isRead && markRead.mutate(item.id)}
        >
          <CardContent className="flex items-start justify-between gap-4 py-4">
            <div>
              <div className="flex items-center gap-2">
                {!item.isRead && <span className="size-1.5 rounded-full bg-primary" />}
                <p className="font-medium">{item.title}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.sender?.name ?? "System"} &middot; {formatDate(item.createdAt)}
              </p>
            </div>
            <Badge variant={TYPE_VARIANT[item.type]}>{item.type}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
