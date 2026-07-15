import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IBook extends Document {
  _id: Types.ObjectId;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  publisher?: string;
  accessionNumber: string;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    publisher: { type: String, trim: true },
    accessionNumber: { type: String, required: true, trim: true, uppercase: true },
    totalCopies: { type: Number, required: true, min: 1 },
    availableCopies: { type: Number, required: true, min: 0 },
    coverUrl: { type: String },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

bookSchema.index({ school: 1, accessionNumber: 1 }, { unique: true });
bookSchema.index({ title: "text", author: "text", category: "text", isbn: "text" });

export const Book: Model<IBook> = models.Book || model<IBook>("Book", bookSchema);
