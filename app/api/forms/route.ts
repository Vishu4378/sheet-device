import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Form } from "@/models/Form";
import { nanoid } from "@/lib/nanoid";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const forms = await Form.find({ userId: user._id }).sort({ createdAt: -1 });
  return NextResponse.json({ forms });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Free plan: max 1 form
  if (user.plan === "free") {
    const count = await Form.countDocuments({ userId: user._id });
    if (count >= 1) {
      return NextResponse.json(
        { error: "Free plan allows only 1 form. Upgrade to create more." },
        { status: 403 }
      );
    }
  }

  const body = await req.json();
  const formId = nanoid(8);

  const form = await Form.create({
    userId: user._id,
    formId,
    title: body.title,
    description: body.description,
    fields: body.fields,
    sheetId: body.sheetId,
    sheetName: body.sheetName,
    sheetHeaders: body.headers || [],
    buttonLabel: body.buttonLabel || "Submit",
    redirectUrl: body.redirectUrl,
    thankYouMessage: body.thankYouMessage || "Thank you for your submission!",
    formStyle: body.formStyle,
    isActive: true,
  });

  return NextResponse.json({ form }, { status: 201 });
}
