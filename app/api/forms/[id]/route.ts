import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Form } from "@/models/Form";
import { applySheetFormatting } from "@/lib/google";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await Form.findOne({ formId: params.id, userId: user._id });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ form });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, fields, sheetId, sheetName, buttonLabel, redirectUrl, thankYouMessage, headers, formStyle, sheetStyling, responseLimit, expiryDate, closedMessage } = body;

  const $set: Record<string, unknown> = {
    title, description, fields, sheetId, sheetName,
    sheetHeaders: headers ?? [],
    buttonLabel, redirectUrl, thankYouMessage, formStyle,
    responseLimit: responseLimit ?? null,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    closedMessage: closedMessage || "This form is no longer accepting responses.",
  };
  if (sheetStyling) $set.styling = sheetStyling;

  const form = await Form.findOneAndUpdate(
    { formId: params.id, userId: user._id },
    { $set },
    { new: true }
  );

  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Re-apply sheet formatting when styling is included in the update
  if (sheetStyling && form.sheetId && form.sheetName) {
    applySheetFormatting(
      session.user.email!,
      form.sheetId,
      form.sheetName,
      sheetStyling
    ).catch(() => {});
  }

  return NextResponse.json({ form });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await Form.findOneAndDelete({ formId: params.id, userId: user._id });

  return NextResponse.json({ success: true });
}
