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
  const isExport = searchParams.get("export") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const since = searchParams.get("since");

  const limit = isExport ? 10_000 : 50;
  const skip = isExport ? 0 : (page - 1) * limit;

  const baseFilter: Record<string, unknown> = { formId: params.formId };
  if (since) baseFilter.submittedAt = { $gte: new Date(since) };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOf7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [submissions, total, todayCount, weekCount] = await Promise.all([
    Submission.find(baseFilter).sort({ submittedAt: -1 }).skip(skip).limit(limit),
    Submission.countDocuments(baseFilter),
    Submission.countDocuments({ formId: params.formId, submittedAt: { $gte: startOfToday } }),
    Submission.countDocuments({ formId: params.formId, submittedAt: { $gte: startOf7Days } }),
  ]);

  const fields = (form.fields as Array<{ type: string; label: string }>)
    .filter((f) => f.type !== "section")
    .map((f) => f.label);

  return NextResponse.json({
    submissions,
    total,
    todayCount,
    weekCount,
    page: isExport ? 1 : page,
    pages: isExport ? 1 : Math.ceil(total / limit),
    fields,
    formTitle: form.title,
    sheetName: form.sheetName,
    sheetId: form.sheetId,
  });
}
