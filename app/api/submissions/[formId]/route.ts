import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Form } from "@/models/Form";
import { Submission } from "@/models/Submission";

export async function GET(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await Form.findOne({ formId: params.formId, userId: user._id });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 50;
  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    Submission.find({ formId: params.formId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit),
    Submission.countDocuments({ formId: params.formId }),
  ]);

  return NextResponse.json({
    submissions,
    total,
    page,
    pages: Math.ceil(total / limit),
    fields: form.fields.map((f: { label: string }) => f.label),
  });
}
