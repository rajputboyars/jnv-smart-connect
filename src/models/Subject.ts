import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface ISubject extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  type: "core" | "elective" | "co_curricular";
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    type: {
      type: String,
      enum: ["core", "elective", "co_curricular"],
      default: "core",
    },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

subjectSchema.index({ school: 1, code: 1 }, { unique: true });

export const Subject: Model<ISubject> =
  models.Subject || model<ISubject>("Subject", subjectSchema);
