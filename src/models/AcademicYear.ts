import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IAcademicYear extends Document {
  _id: Types.ObjectId;
  name: string;
  school: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const academicYearSchema = new Schema<IAcademicYear>(
  {
    name: { type: String, required: true, trim: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

academicYearSchema.index({ school: 1, name: 1 }, { unique: true });

export const AcademicYear: Model<IAcademicYear> =
  models.AcademicYear || model<IAcademicYear>("AcademicYear", academicYearSchema);
