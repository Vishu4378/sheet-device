import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Form } from "@/models/Form";
import {
  getSheetHeaders,
  updateHeaderRow,
  applySheetFormatting,
  SheetFormattingOptions,
} from "@/lib/google";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const formId = searchParams.get("formId");
  if (!formId) {
    return NextResponse.json({ error: "formId required" }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const form = await Form.findOne({ formId, userId: user._id });
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const headers = await getSheetHeaders(session.user.email, form.sheetId, form.sheetName);
    return NextResponse.json({ headers });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as Record<string, unknown>;
    const {
      formId, headers,
      headerBgColor, headerTextColor,
      boldHeader, headerItalic, headerAlignment,
      freezeHeader, enableBanding,
      oddRowColor, evenRowColor,
      autoResizeColumns,
    } = body;

    if (typeof formId !== "string") {
      return NextResponse.json({ error: "formId required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const form = await Form.findOne({ formId, userId: user._id });
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    if (Array.isArray(headers)) {
      const headerStrings = (headers as unknown[]).map((h) => String(h));
      await updateHeaderRow(session.user.email, form.sheetId, form.sheetName, headerStrings);
      // Use $set to guarantee the array is replaced in MongoDB — avoids any
      // Mongoose change-detection edge cases on array fields.
      await Form.findByIdAndUpdate(form._id, { $set: { sheetHeaders: headerStrings } });
    }

    const formattingOptions: SheetFormattingOptions = {};
    if (typeof headerBgColor === "string") formattingOptions.headerBgColor = headerBgColor;
    if (typeof headerTextColor === "string") formattingOptions.headerTextColor = headerTextColor;
    if (typeof boldHeader === "boolean") formattingOptions.boldHeader = boldHeader;
    if (typeof headerItalic === "boolean") formattingOptions.headerItalic = headerItalic;
    if (headerAlignment === "LEFT" || headerAlignment === "CENTER" || headerAlignment === "RIGHT") {
      formattingOptions.headerAlignment = headerAlignment;
    }
    if (typeof freezeHeader === "boolean") formattingOptions.freezeHeader = freezeHeader;
    if (typeof enableBanding === "boolean") formattingOptions.enableBanding = enableBanding;
    if (typeof oddRowColor === "string") formattingOptions.oddRowColor = oddRowColor;
    if (typeof evenRowColor === "string") formattingOptions.evenRowColor = evenRowColor;
    if (typeof autoResizeColumns === "boolean") formattingOptions.autoResizeColumns = autoResizeColumns;

    const hasFormatting = Object.keys(formattingOptions).length > 0;
    if (hasFormatting) {
      await applySheetFormatting(session.user.email, form.sheetId, form.sheetName, formattingOptions);
      await Form.findByIdAndUpdate(form._id, { $set: { styling: formattingOptions } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
