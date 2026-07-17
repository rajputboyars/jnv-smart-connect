import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { EMPLOYEE_DOCUMENT_TYPES, type EmployeeDocumentType } from "./enums";

export interface IEmployeeDocument extends Document {
  _id: Types.ObjectId;
  teacher: Types.ObjectId;
  docType: EmployeeDocumentType;
  fileUrl: string;
  fileName: string;
  uploadedBy: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const employeeDocumentSchema = new Schema<IEmployeeDocument>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    docType: { type: String, enum: EMPLOYEE_DOCUMENT_TYPES, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true, trim: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

employeeDocumentSchema.index({ school: 1, teacher: 1, docType: 1 });

export const EmployeeDocument: Model<IEmployeeDocument> =
  models.EmployeeDocument || model<IEmployeeDocument>("EmployeeDocument", employeeDocumentSchema);
