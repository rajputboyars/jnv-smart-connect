import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IClass extends Document {
  _id: Types.ObjectId;
  name: string;
  numericLevel: number;
  school: Types.ObjectId;
  academicYear: Types.ObjectId;
  subjects: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, trim: true },
    numericLevel: { type: Number, required: true, min: 6, max: 12 },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
      index: true,
    },
    subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
  },
  { timestamps: true }
);

classSchema.index({ school: 1, academicYear: 1, name: 1 }, { unique: true });

export const Class: Model<IClass> = models.Class || model<IClass>("Class", classSchema);
