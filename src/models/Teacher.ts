import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { STAFF_STATUSES, type StaffStatus } from "./enums";

export interface IAssignedClass {
  class: Types.ObjectId;
  section: Types.ObjectId;
  subject: Types.ObjectId;
}

export interface ITeacher extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  qualification: string;
  designation?: string;
  subjects: Types.ObjectId[];
  assignedClasses: IAssignedClass[];
  experienceYears: number;
  joiningDate: Date;
  status: StaffStatus;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignedClassSchema = new Schema<IAssignedClass>(
  {
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  },
  { _id: false }
);

const teacherSchema = new Schema<ITeacher>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    photoUrl: { type: String },
    qualification: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
    subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    assignedClasses: [assignedClassSchema],
    experienceYears: { type: Number, default: 0, min: 0 },
    joiningDate: { type: Date, required: true },
    status: { type: String, enum: STAFF_STATUSES, default: "active" },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

teacherSchema.index({ school: 1, employeeId: 1 }, { unique: true });
teacherSchema.index({ name: "text", employeeId: "text", email: "text" });

export const Teacher: Model<ITeacher> =
  models.Teacher || model<ITeacher>("Teacher", teacherSchema);
