import { Schema, model, models, type Document, type Model, Types } from "mongoose";

// Shared between the Finance module (expense/vendor payments) and the
// Inventory module (purchase orders) — a school has one vendor directory,
// not two.
export interface IVendor extends Document {
  _id: Types.ObjectId;
  name: string;
  category: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  isActive: boolean;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    isActive: { type: Boolean, default: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

vendorSchema.index({ school: 1, name: 1 }, { unique: true });

export const Vendor: Model<IVendor> = models.Vendor || model<IVendor>("Vendor", vendorSchema);
