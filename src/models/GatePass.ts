import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { GATE_PASS_STATUSES, type GatePassStatus } from "./enums";

export interface IGatePass extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  leaveRequest?: Types.ObjectId;
  purpose: string;
  outTime: Date;
  expectedInTime: Date;
  actualInTime?: Date;
  issuedBy: Types.ObjectId;
  status: GatePassStatus;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gatePassSchema = new Schema<IGatePass>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    leaveRequest: { type: Schema.Types.ObjectId, ref: "LeaveRequest" },
    purpose: { type: String, required: true, trim: true, maxlength: 300 },
    outTime: { type: Date, required: true, default: () => new Date() },
    expectedInTime: { type: Date, required: true },
    actualInTime: { type: Date },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: GATE_PASS_STATUSES, default: "issued" },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

gatePassSchema.index({ school: 1, status: 1, createdAt: -1 });

export const GatePass: Model<IGatePass> =
  models.GatePass || model<IGatePass>("GatePass", gatePassSchema);
