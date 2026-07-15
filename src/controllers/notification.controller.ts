import { Types, type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Notification, type INotification } from "@/models/Notification";
import { ApiError } from "@/lib/utils/api-error";
import type { CreateNotificationInput } from "@/validators/notification.validator";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

export async function listNotificationsForUser(
  session: AccessTokenPayload,
  pagination: { page: number; limit: number }
) {
  await connectDB();

  const filter: QueryFilter<INotification> = {
    ...(session.school ? { school: session.school } : {}),
    $or: [
      { audienceScope: "all" as const },
      { audienceScope: "roles" as const, audienceRoles: session.role },
      { audienceScope: "users" as const, audienceUsers: new Types.ObjectId(session.sub) },
    ],
  };

  const skip = (pagination.page - 1) * pagination.limit;

  const [items, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .populate("sender", "name role")
      .lean(),
    Notification.countDocuments(filter),
  ]);

  const shaped = items.map((item) => ({
    id: item._id.toString(),
    title: item.title,
    message: item.message,
    type: item.type,
    createdAt: item.createdAt,
    sender: item.sender,
    isRead: item.readBy.some((r) => r.user.toString() === session.sub),
  }));

  const unreadCount = shaped.filter((n) => !n.isRead).length;

  return { items: shaped, total, unreadCount };
}

export async function createNotification(
  input: CreateNotificationInput,
  session: AccessTokenPayload
) {
  await connectDB();

  if (!session.school) {
    throw ApiError.badRequest("Your account is not linked to a school");
  }

  const notification = await Notification.create({
    ...input,
    sender: session.sub,
    school: session.school,
  });

  return { id: notification._id.toString() };
}

export async function markNotificationRead(notificationId: string, userId: string) {
  await connectDB();

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }

  const alreadyRead = notification.readBy.some((r) => r.user.toString() === userId);
  if (!alreadyRead) {
    notification.readBy.push({ user: new Types.ObjectId(userId), readAt: new Date() });
    await notification.save();
  }

  return { id: notification._id.toString() };
}
