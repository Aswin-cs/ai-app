import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICase extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileSummary?: string;
  prompt?: string;
  status: "processing" | "completed" | "failed";
  analysis: Record<string, unknown> | null;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema: Schema<ICase> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
    },
    fileSummary: {
      type: String,
      default: "",
    },
    prompt: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    analysis: {
      type: Schema.Types.Mixed,
      default: null,
    },
    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user history queries with sorting
CaseSchema.index({ userId: 1, createdAt: -1 });

// Prevent re-compilation of model in serverless environment
const Case: Model<ICase> =
  mongoose.models.Case || mongoose.model<ICase>("Case", CaseSchema);

export default Case;
