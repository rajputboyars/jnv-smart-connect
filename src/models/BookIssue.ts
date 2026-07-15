import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { BOOK_ISSUE_STATUSES, type BookIssueStatus } from "./enums";

export interface IBookIssue extends Document {
  _id: Types.ObjectId;
  book: Types.ObjectId;
  student: Types.ObjectId;
  issuedDate: Date;
  dueDate: Date;
  returnedDate?: Date;
  fineAmount: number;
  finePaid: boolean;
  status: BookIssueStatus;
  issuedBy: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookIssueSchema = new Schema<IBookIssue>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    issuedDate: { type: Date, required: true, default: () => new Date() },
    dueDate: { type: Date, required: true },
    returnedDate: { type: Date },
    fineAmount: { type: Number, default: 0, min: 0 },
    finePaid: { type: Boolean, default: false },
    status: { type: String, enum: BOOK_ISSUE_STATUSES, default: "issued" },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

bookIssueSchema.index({ school: 1, status: 1 });

export const BookIssue: Model<IBookIssue> =
  models.BookIssue || model<IBookIssue>("BookIssue", bookIssueSchema);
