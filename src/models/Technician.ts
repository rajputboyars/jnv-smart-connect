import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { MAINTENANCE_CATEGORIES, type MaintenanceCategory } from "./enums";

export interface ITechnician extends Document {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  specialization: MaintenanceCategory;
  active: boolean;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const technicianSchema = new Schema<ITechnician>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    specialization: { type: String, enum: MAINTENANCE_CATEGORIES, required: true },
    active: { type: Boolean, default: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

technicianSchema.index({ school: 1, specialization: 1 });

export const Technician: Model<ITechnician> =
  models.Technician || model<ITechnician>("Technician", technicianSchema);
