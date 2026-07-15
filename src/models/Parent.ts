import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IParent extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  occupation?: string;
  address?: string;
  children: Types.ObjectId[];
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const parentSchema = new Schema<IParent>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    occupation: { type: String, trim: true },
    address: { type: String, trim: true },
    children: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

export const Parent: Model<IParent> =
  models.Parent || model<IParent>("Parent", parentSchema);
