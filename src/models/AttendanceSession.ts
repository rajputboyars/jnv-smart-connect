import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IAttendanceSession extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  academicYear: Types.ObjectId;
  class: Types.ObjectId;
  section: Types.ObjectId;
  subject?: Types.ObjectId;
  date: Date;
  period?: number;
  createdBy: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  checkedInStudents: Types.ObjectId[];
  createdAt: Date;
}

const attendanceSessionSchema = new Schema<IAttendanceSession>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    date: { type: Date, required: true },
    period: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    checkedInStudents: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AttendanceSession: Model<IAttendanceSession> =
  models.AttendanceSession || model<IAttendanceSession>("AttendanceSession", attendanceSessionSchema);
