import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { STAFF_LEAVE_TYPES, LEAVE_REQUEST_STATUSES, type StaffLeaveType, type LeaveRequestStatus } from "./enums";

export interface IStaffLeaveRequest extends Document {
  _id: Types.ObjectId;
  teacher: Types.ObjectId;
  leaveType: StaffLeaveType;
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

const staffLeaveRequestSchema = new Schema<IStaffLeaveRequest>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    leaveType: { type: String, enum: STAFF_LEAVE_TYPES, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: LEAVE_REQUEST_STATUSES, default: "pending" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String, trim: true, maxlength: 500 },
    reviewedAt: { type: Date },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

staffLeaveRequestSchema.index({ school: 1, status: 1, createdAt: -1 });

export const StaffLeaveRequest: Model<IStaffLeaveRequest> =
  models.StaffLeaveRequest || model<IStaffLeaveRequest>("StaffLeaveRequest", staffLeaveRequestSchema);
