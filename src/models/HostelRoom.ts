import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IHostelRoom extends Document {
  _id: Types.ObjectId;
  building: Types.ObjectId;
  roomNumber: string;
  floor: number;
  bedCount: number;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const hostelRoomSchema = new Schema<IHostelRoom>(
  {
    building: { type: Schema.Types.ObjectId, ref: "HostelBuilding", required: true, index: true },
    roomNumber: { type: String, required: true, trim: true },
    floor: { type: Number, required: true, min: 0 },
    bedCount: { type: Number, required: true, min: 1, max: 12 },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

hostelRoomSchema.index({ building: 1, roomNumber: 1 }, { unique: true });

export const HostelRoom: Model<IHostelRoom> =
  models.HostelRoom || model<IHostelRoom>("HostelRoom", hostelRoomSchema);
