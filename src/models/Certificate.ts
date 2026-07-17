import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface ICertificate extends Document {
  _id: Types.ObjectId;
  event: Types.ObjectId;
  participant: Types.ObjectId;
  title: string;
  issuedBy: Types.ObjectId;
  issuedAt: Date;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    participant: { type: Schema.Types.ObjectId, ref: "EventParticipant", required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuedAt: { type: Date, default: Date.now },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

certificateSchema.index({ event: 1, participant: 1 }, { unique: true });

export const Certificate: Model<ICertificate> =
  models.Certificate || model<ICertificate>("Certificate", certificateSchema);
