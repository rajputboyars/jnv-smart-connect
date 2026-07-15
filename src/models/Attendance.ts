import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import {
  ATTENDANCE_ENTITY_TYPES,
  ATTENDANCE_METHODS,
  ATTENDANCE_STATUSES,
  type AttendanceEntityType,
  type AttendanceMethod,
  type AttendanceStatus,
} from "./enums";

export interface IAttendance extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  academicYear: Types.ObjectId;
  date: Date;
  entityType: AttendanceEntityType;
  student?: Types.ObjectId;
  teacher?: Types.ObjectId;
  class?: Types.ObjectId;
  section?: Types.ObjectId;
  status: AttendanceStatus;
  remarks?: string;
  markedBy: Types.ObjectId;
  method: AttendanceMethod;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    date: { type: Date, required: true },
    entityType: { type: String, enum: ATTENDANCE_ENTITY_TYPES, required: true },
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
    class: { type: Schema.Types.ObjectId, ref: "Class" },
    section: { type: Schema.Types.ObjectId, ref: "Section" },
    status: { type: String, enum: ATTENDANCE_STATUSES, required: true },
    remarks: { type: String, trim: true },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    method: { type: String, enum: ATTENDANCE_METHODS, default: "manual" },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { entityType: 1, student: 1, date: 1 },
  { unique: true, partialFilterExpression: { entityType: "student" } }
);
attendanceSchema.index(
  { entityType: 1, teacher: 1, date: 1 },
  { unique: true, partialFilterExpression: { entityType: "teacher" } }
);
attendanceSchema.index({ school: 1, class: 1, section: 1, date: 1 });

export const Attendance: Model<IAttendance> =
  models.Attendance || model<IAttendance>("Attendance", attendanceSchema);
