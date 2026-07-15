import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface ISection extends Document {
  _id: Types.ObjectId;
  name: string;
  class: Types.ObjectId;
  classTeacher?: Types.ObjectId;
  capacity: number;
  school: Types.ObjectId;
  academicYear: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true, trim: true, uppercase: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    classTeacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
    capacity: { type: Number, default: 40 },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

sectionSchema.index({ class: 1, name: 1 }, { unique: true });

export const Section: Model<ISection> =
  models.Section || model<ISection>("Section", sectionSchema);
