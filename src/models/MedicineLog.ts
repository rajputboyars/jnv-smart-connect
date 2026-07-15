import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { MEDICINE_ROUTES, type MedicineRoute } from "./enums";

export interface IMedicineLog extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  medicineName: string;
  dosage: string;
  route: MedicineRoute;
  givenAt: Date;
  givenBy: Types.ObjectId;
  notes?: string;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const medicineLogSchema = new Schema<IMedicineLog>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    route: { type: String, enum: MEDICINE_ROUTES, default: "oral" },
    givenAt: { type: Date, required: true, default: () => new Date() },
    givenBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, trim: true, maxlength: 500 },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

medicineLogSchema.index({ student: 1, givenAt: -1 });

export const MedicineLog: Model<IMedicineLog> =
  models.MedicineLog || model<IMedicineLog>("MedicineLog", medicineLogSchema);
