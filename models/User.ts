import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  googleTokens: {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  };
  plan: "free" | "pro" | "agency";
  submissionCount: number;
  submissionResetDate: Date;
  emailNotifications: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: String,
  googleTokens: {
    access_token: String,
    refresh_token: String,
    expiry_date: Number,
  },
  plan: { type: String, enum: ["free", "pro", "agency"], default: "free" },
  submissionCount: { type: Number, default: 0 },
  submissionResetDate: { type: Date, default: Date.now },
  emailNotifications: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
