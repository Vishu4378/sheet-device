import mongoose, { Schema, Document } from "mongoose";

export interface IField {
  label: string;
  type: "text" | "email" | "phone" | "dropdown" | "checkbox" | "date" | "section";
  required: boolean;
  options?: string[];
  sheetColumn: string;
  placeholder?: string;
  helpText?: string;
  width?: "full" | "half";
  condition?: IFieldCondition;
}

export interface IStyling {
  headerBgColor: string;
  headerTextColor: string;
  boldHeader: boolean;
  headerItalic: boolean;
  headerAlignment: "LEFT" | "CENTER" | "RIGHT";
  freezeHeader: boolean;
  enableBanding: boolean;
  oddRowColor: string;
  evenRowColor: string;
  autoResizeColumns: boolean;
}

export interface IFormStyle {
  accentColor: string;
  bgStyle: "gray" | "white" | "tinted";
  buttonStyle: "filled" | "outline" | "soft";
  formWidth: "narrow" | "standard" | "wide";
}

export interface IFieldCondition {
  fieldLabel: string;
  operator: "equals" | "not_equals" | "contains" | "is_not_empty";
  value: string;
}

export interface IForm extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  fields: IField[];
  sheetId: string;
  sheetName: string;
  formId: string;
  buttonLabel: string;
  redirectUrl?: string;
  thankYouMessage: string;
  sheetHeaders: string[];
  styling?: IStyling;
  formStyle?: IFormStyle;
  isActive: boolean;
  submissionCount: number;
  viewCount: number;
  createdAt: Date;
  responseLimit?: number | null;
  expiryDate?: Date | null;
  closedMessage?: string;
}

const FieldSchema = new Schema<IField>({
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "email", "phone", "dropdown", "checkbox", "date", "section"],
    required: true,
  },
  required: { type: Boolean, default: false },
  options: [String],
  sheetColumn: { type: String, default: "" },
  placeholder: String,
  helpText: String,
  width: { type: String, enum: ["full", "half"], default: "full" },
  condition: {
    fieldLabel: { type: String, default: "" },
    operator:   { type: String, enum: ["equals", "not_equals", "contains", "is_not_empty"], default: "equals" },
    value:      { type: String, default: "" },
  },
});

const FormSchema = new Schema<IForm>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  fields: [FieldSchema],
  sheetId: { type: String, required: true },
  sheetName: { type: String, required: true },
  formId: { type: String, required: true, unique: true },
  buttonLabel: { type: String, default: "Submit" },
  redirectUrl: String,
  thankYouMessage: { type: String, default: "Thank you for your submission!" },
  sheetHeaders: { type: [String], default: [] },
  styling: {
    headerBgColor:     { type: String,  default: "#f8fafc" },
    headerTextColor:   { type: String,  default: "#1e293b" },
    boldHeader:        { type: Boolean, default: true },
    headerItalic:      { type: Boolean, default: false },
    headerAlignment:   { type: String,  default: "LEFT" },
    freezeHeader:      { type: Boolean, default: true },
    enableBanding:     { type: Boolean, default: false },
    oddRowColor:       { type: String,  default: "#f8fafc" },
    evenRowColor:      { type: String,  default: "#ffffff" },
    autoResizeColumns: { type: Boolean, default: true },
  },
  formStyle: {
    accentColor: { type: String, default: "#7c3aed" },
    bgStyle:     { type: String, default: "gray" },
    buttonStyle: { type: String, default: "filled" },
    formWidth:   { type: String, default: "standard" },
  },
  isActive: { type: Boolean, default: true },
  submissionCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  responseLimit: { type: Number, default: null },
  expiryDate: { type: Date, default: null },
  closedMessage: { type: String, default: "This form is no longer accepting responses." },
});

export const Form = mongoose.models.Form || mongoose.model<IForm>("Form", FormSchema);
