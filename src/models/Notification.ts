import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import {
  NOTIFICATION_AUDIENCE_SCOPES,
  NOTIFICATION_TYPES,
  type NotificationAudienceScope,
  type NotificationType,
} from "./enums";
import type { Role } from "@/types/roles";

export interface INotificationReceipt {
  user: Types.ObjectId;
  readAt: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  audienceScope: NotificationAudienceScope;
  audienceRoles: Role[];
  audienceClass?: Types.ObjectId;
  audienceSection?: Types.ObjectId;
  audienceUsers: Types.ObjectId[];
  sender: Types.ObjectId;
  school: Types.ObjectId;
  readBy: INotificationReceipt[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    type: { type: String, enum: NOTIFICATION_TYPES, default: "info" },
    audienceScope: {
      type: String,
      enum: NOTIFICATION_AUDIENCE_SCOPES,
      default: "all",
    },
    audienceRoles: [{ type: String }],
    audienceClass: { type: Schema.Types.ObjectId, ref: "Class" },
    audienceSection: { type: Schema.Types.ObjectId, ref: "Section" },
    audienceUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    readBy: [
      {
        _id: false,
        user: { type: Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date },
      },
    ],
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ school: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  models.Notification || model<INotification>("Notification", notificationSchema);
