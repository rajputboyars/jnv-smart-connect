import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { EVENT_PARTICIPANT_ROLES, type EventParticipantRole } from "./enums";

export interface IEventParticipant extends Document {
  _id: Types.ObjectId;
  event: Types.ObjectId;
  student: Types.ObjectId;
  role: EventParticipantRole;
  position?: string;
  remarks?: string;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventParticipantSchema = new Schema<IEventParticipant>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    role: { type: String, enum: EVENT_PARTICIPANT_ROLES, default: "participant" },
    position: { type: String, trim: true, maxlength: 100 },
    remarks: { type: String, trim: true, maxlength: 500 },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

eventParticipantSchema.index({ event: 1, student: 1 }, { unique: true });

export const EventParticipant: Model<IEventParticipant> =
  models.EventParticipant || model<IEventParticipant>("EventParticipant", eventParticipantSchema);
