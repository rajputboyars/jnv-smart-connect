import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { LEAVE_REQUEST_STATUSES, type LeaveRequestStatus } from "./enums";

export interface ILeaveRequest extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  requestedBy: Types.ObjectId;
  fromDate: Date;
  toDate: Date;
  reason: string;
  status: LeaveRequestStatus;
  reviewedBy?: Types.ObjectId;
  reviewNote?: string;
  reviewedAt?: Date;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: LEAVE_REQUEST_STATUSES, default: "pending" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String, trim: true },
    reviewedAt: { type: Date },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ school: 1, status: 1, createdAt: -1 });

export const LeaveRequest: Model<ILeaveRequest> =
  models.LeaveRequest || model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);
