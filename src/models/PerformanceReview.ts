import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IPerformanceReview extends Document {
  _id: Types.ObjectId;
  teacher: Types.ObjectId;
  academicYear: Types.ObjectId;
  reviewedBy: Types.ObjectId;
  rating: number;
  strengths?: string;
  areasOfImprovement?: string;
  goals?: string;
  reviewDate: Date;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const performanceReviewSchema = new Schema<IPerformanceReview>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    strengths: { type: String, trim: true, maxlength: 1000 },
    areasOfImprovement: { type: String, trim: true, maxlength: 1000 },
    goals: { type: String, trim: true, maxlength: 1000 },
    reviewDate: { type: Date, required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

performanceReviewSchema.index({ school: 1, teacher: 1, academicYear: 1 });

export const PerformanceReview: Model<IPerformanceReview> =
  models.PerformanceReview || model<IPerformanceReview>("PerformanceReview", performanceReviewSchema);
