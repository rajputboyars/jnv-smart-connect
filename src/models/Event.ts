import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { EVENT_TYPES, type EventType } from "./enums";

export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  type: EventType;
  description?: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  organizer: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, enum: EVENT_TYPES, required: true },
    description: { type: String, trim: true, maxlength: 1000 },
    venue: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

eventSchema.index({ school: 1, startDate: -1 });
eventSchema.index({ school: 1, type: 1 });
eventSchema.index({ title: "text", venue: "text" });

export const Event: Model<IEvent> = models.Event || model<IEvent>("Event", eventSchema);
