import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { HOSTEL_NIGHT_STATUSES, type HostelNightStatus } from "./enums";

export interface IHostelAttendance extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  building: Types.ObjectId;
  date: Date;
  status: HostelNightStatus;
  remarks?: string;
  markedBy: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const hostelAttendanceSchema = new Schema<IHostelAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    building: { type: Schema.Types.ObjectId, ref: "HostelBuilding", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: HOSTEL_NIGHT_STATUSES, required: true },
    remarks: { type: String, trim: true },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

hostelAttendanceSchema.index({ student: 1, date: 1 }, { unique: true });
hostelAttendanceSchema.index({ building: 1, date: 1 });

export const HostelAttendance: Model<IHostelAttendance> =
  models.HostelAttendance || model<IHostelAttendance>("HostelAttendance", hostelAttendanceSchema);
