import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Form } from "@/models/Form";

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
  const { title, description, fields, sheetId, sheetName, buttonLabel, redirectUrl, thankYouMessage, headers, formStyle } = body;

  const form = await Form.findOneAndUpdate(
    { formId: params.id, userId: user._id },
    { $set: { title, description, fields, sheetId, sheetName, sheetHeaders: headers ?? [], buttonLabel, redirectUrl, thankYouMessage, formStyle } },
    { new: true }
  );

  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
