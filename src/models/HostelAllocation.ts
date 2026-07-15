import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { HOSTEL_ALLOCATION_STATUSES, type HostelAllocationStatus } from "./enums";

export interface IHostelAllocation extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  room: Types.ObjectId;
  bedNumber: number;
  academicYear: Types.ObjectId;
  school: Types.ObjectId;
  status: HostelAllocationStatus;
  allocatedAt: Date;
  vacatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const hostelAllocationSchema = new Schema<IHostelAllocation>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    room: { type: Schema.Types.ObjectId, ref: "HostelRoom", required: true, index: true },
    bedNumber: { type: Number, required: true, min: 1 },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    status: { type: String, enum: HOSTEL_ALLOCATION_STATUSES, default: "active" },
    allocatedAt: { type: Date, default: () => new Date() },
    vacatedAt: { type: Date },
  },
  { timestamps: true }
);

// A student can only have one active allocation at a time.
hostelAllocationSchema.index(
  { student: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);
// A bed can only be actively occupied by one student at a time.
hostelAllocationSchema.index(
  { room: 1, bedNumber: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

export const HostelAllocation: Model<IHostelAllocation> =
  models.HostelAllocation || model<IHostelAllocation>("HostelAllocation", hostelAllocationSchema);
