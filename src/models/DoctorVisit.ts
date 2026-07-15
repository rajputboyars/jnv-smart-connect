import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IDoctorVisit extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  visitDate: Date;
  reason: string;
  diagnosis?: string;
  prescription?: string;
  doctorName: string;
  followUpDate?: Date;
  loggedBy: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const doctorVisitSchema = new Schema<IDoctorVisit>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    visitDate: { type: Date, required: true, default: () => new Date() },
    reason: { type: String, required: true, trim: true, maxlength: 300 },
    diagnosis: { type: String, trim: true, maxlength: 500 },
    prescription: { type: String, trim: true, maxlength: 500 },
    doctorName: { type: String, required: true, trim: true },
    followUpDate: { type: Date },
    loggedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

doctorVisitSchema.index({ student: 1, visitDate: -1 });

export const DoctorVisit: Model<IDoctorVisit> =
  models.DoctorVisit || model<IDoctorVisit>("DoctorVisit", doctorVisitSchema);
