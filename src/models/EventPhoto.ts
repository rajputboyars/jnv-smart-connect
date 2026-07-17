import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IEventPhoto extends Document {
  _id: Types.ObjectId;
  event: Types.ObjectId;
  url: string;
  caption?: string;
  uploadedBy: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventPhotoSchema = new Schema<IEventPhoto>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    url: { type: String, required: true },
    caption: { type: String, trim: true, maxlength: 300 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

eventPhotoSchema.index({ event: 1, createdAt: -1 });

export const EventPhoto: Model<IEventPhoto> =
  models.EventPhoto || model<IEventPhoto>("EventPhoto", eventPhotoSchema);
