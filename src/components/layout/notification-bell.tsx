"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/use-notifications";
import { cn, formatDate } from "@/lib/utils";

export function NotificationBell() {
  const { data, isLoading, markRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {!!data?.unreadCount && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {data.unreadCount > 9 ? "9+" : data.unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {!!data?.unreadCount && <Badge variant="secondary">{data.unreadCount} unread</Badge>}
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {isLoading && (
            <div className="space-y-3 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {!isLoading && data?.items.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          )}

          {data?.items.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.isRead && markRead.mutate(item.id)}
              className={cn(
                "flex w-full flex-col gap-0.5 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent/40",
                !item.isRead && "bg-primary/5"
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {!item.isRead && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                {item.title}
              </span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{item.message}</span>
              <span className="text-[11px] text-muted-foreground/70">
                {formatDate(item.createdAt)}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
