import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface ISchool extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  region?: string;
  district?: string;
  state?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  establishedYear?: number;
  activeAcademicYear?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    region: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    address: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    logoUrl: { type: String },
    establishedYear: { type: Number },
    activeAcademicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
  },
  { timestamps: true }
);

export const School: Model<ISchool> =
  models.School || model<ISchool>("School", schoolSchema);
