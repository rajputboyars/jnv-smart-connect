import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { SCHOLARSHIP_TYPES, type ScholarshipType } from "./enums";

export interface IScholarship extends Document {
  _id: Types.ObjectId;
  name: string;
  type: ScholarshipType;
  value: number;
  criteria?: string;
  isActive: boolean;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const scholarshipSchema = new Schema<IScholarship>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: SCHOLARSHIP_TYPES, required: true },
    value: { type: Number, required: true, min: 0 },
    criteria: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, default: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

export const Scholarship: Model<IScholarship> =
  models.Scholarship || model<IScholarship>("Scholarship", scholarshipSchema);
