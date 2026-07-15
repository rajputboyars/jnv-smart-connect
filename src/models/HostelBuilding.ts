import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IHostelBuilding extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  gender: "boys" | "girls" | "mixed";
  warden?: Types.ObjectId;
  totalFloors: number;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const hostelBuildingSchema = new Schema<IHostelBuilding>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    gender: { type: String, enum: ["boys", "girls", "mixed"], required: true },
    warden: { type: Schema.Types.ObjectId, ref: "Teacher" },
    totalFloors: { type: Number, default: 1, min: 1 },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

hostelBuildingSchema.index({ school: 1, code: 1 }, { unique: true });

export const HostelBuilding: Model<IHostelBuilding> =
  models.HostelBuilding || model<IHostelBuilding>("HostelBuilding", hostelBuildingSchema);
