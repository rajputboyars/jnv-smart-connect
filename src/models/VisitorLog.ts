import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IVisitorLog extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  visitorName: string;
  visitorPhone: string;
  relation: string;
  purpose: string;
  checkInTime: Date;
  checkOutTime?: Date;
  approvedBy: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const visitorLogSchema = new Schema<IVisitorLog>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    visitorName: { type: String, required: true, trim: true },
    visitorPhone: { type: String, required: true, trim: true },
    relation: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true, maxlength: 300 },
    checkInTime: { type: Date, required: true, default: () => new Date() },
    checkOutTime: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

visitorLogSchema.index({ school: 1, createdAt: -1 });

export const VisitorLog: Model<IVisitorLog> =
  models.VisitorLog || model<IVisitorLog>("VisitorLog", visitorLogSchema);
