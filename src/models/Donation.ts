import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IDonation extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  donorName: string;
  donorContact?: string;
  donorPan?: string;
  amount: number;
  purpose?: string;
  date: Date;
  receiptNumber: string;
  receivedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<IDonation>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    donorName: { type: String, required: true, trim: true },
    donorContact: { type: String, trim: true },
    donorPan: { type: String, trim: true, uppercase: true },
    amount: { type: Number, required: true, min: 0.01 },
    purpose: { type: String, trim: true, maxlength: 300 },
    date: { type: Date, required: true, default: () => new Date() },
    receiptNumber: { type: String, required: true, trim: true, uppercase: true },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

donationSchema.index({ school: 1, receiptNumber: 1 }, { unique: true });
donationSchema.index({ school: 1, date: -1 });

export const Donation: Model<IDonation> = models.Donation || model<IDonation>("Donation", donationSchema);
