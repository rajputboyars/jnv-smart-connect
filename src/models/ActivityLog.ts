import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  action: string;
  entityType?: string;
  entityId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  school?: Types.ObjectId;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, trim: true },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    school: { type: Schema.Types.ObjectId, ref: "School" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ school: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

export const ActivityLog: Model<IActivityLog> =
  models.ActivityLog || model<IActivityLog>("ActivityLog", activityLogSchema);
