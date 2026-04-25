import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
  formId: string;
  data: Record<string, any>;
  submittedAt: Date;
  ipAddress?: string;
}

const SubmissionSchema = new Schema<ISubmission>({
  formId: { type: String, required: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  submittedAt: { type: Date, default: Date.now },
  ipAddress: String,
});

export const Submission =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);
