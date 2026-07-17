import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import {
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  type MaintenanceCategory,
  type MaintenancePriority,
  type MaintenanceStatus,
} from "./enums";

export interface ITimelineEntry {
  status: MaintenanceStatus;
  note?: string;
  by: Types.ObjectId;
  at: Date;
}

export interface IMaintenanceTicket extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  location: string;
  status: MaintenanceStatus;
  raisedBy: Types.ObjectId;
  assignedTechnician?: Types.ObjectId;
  timeline: ITimelineEntry[];
  resolutionNote?: string;
  resolvedAt?: Date;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const timelineEntrySchema = new Schema<ITimelineEntry>(
  {
    status: { type: String, enum: MAINTENANCE_STATUSES, required: true },
    note: { type: String, trim: true, maxlength: 500 },
    by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const maintenanceTicketSchema = new Schema<IMaintenanceTicket>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    category: { type: String, enum: MAINTENANCE_CATEGORIES, required: true },
    priority: { type: String, enum: MAINTENANCE_PRIORITIES, default: "medium" },
    location: { type: String, required: true, trim: true },
    status: { type: String, enum: MAINTENANCE_STATUSES, default: "open" },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assignedTechnician: { type: Schema.Types.ObjectId, ref: "Technician" },
    timeline: [timelineEntrySchema],
    resolutionNote: { type: String, trim: true, maxlength: 1000 },
    resolvedAt: { type: Date },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

maintenanceTicketSchema.index({ school: 1, status: 1, createdAt: -1 });
maintenanceTicketSchema.index({ school: 1, category: 1 });

export const MaintenanceTicket: Model<IMaintenanceTicket> =
  models.MaintenanceTicket || model<IMaintenanceTicket>("MaintenanceTicket", maintenanceTicketSchema);
