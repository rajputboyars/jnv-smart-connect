import { apiFetch } from "@/lib/api-client";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "urgent";
  createdAt: string;
  isRead: boolean;
  sender?: { name: string; role: string };
}

export interface NotificationFeed {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export async function fetchNotifications(page = 1, limit = 10) {
  const res = await apiFetch<NotificationFeed>(
    `/api/notifications?page=${page}&limit=${limit}`
  );
  return res.data as NotificationFeed;
}

export async function markNotificationReadRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/notifications/${id}/read`, { method: "POST" });
}
