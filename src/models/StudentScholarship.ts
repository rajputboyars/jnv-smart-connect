import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IStudentScholarship extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  student: Types.ObjectId;
  scholarship: Types.ObjectId;
  academicYear: Types.ObjectId;
  approvedBy: Types.ObjectId;
  approvedAt: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentScholarshipSchema = new Schema<IStudentScholarship>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    scholarship: { type: Schema.Types.ObjectId, ref: "Scholarship", required: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedAt: { type: Date, default: () => new Date() },
    remarks: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

studentScholarshipSchema.index({ student: 1, scholarship: 1, academicYear: 1 }, { unique: true });

export const StudentScholarship: Model<IStudentScholarship> =
  models.StudentScholarship || model<IStudentScholarship>("StudentScholarship", studentScholarshipSchema);
