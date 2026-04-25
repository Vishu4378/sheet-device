import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Form } from "@/models/Form";
import { User } from "@/models/User";
import { Submission } from "@/models/Submission";
import { appendToSheet } from "@/lib/google";
import { sendSubmissionNotification } from "@/lib/email";

const FREE_LIMIT = 100;

export async function POST(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  await connectDB();

  const form = await Form.findOne({ formId: params.formId, isActive: true });
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const body = await req.json();

  // Honeypot spam check
  if (body.company) {
    return NextResponse.json({ success: true }); // silently reject
  }

  // Plan limit check
  const user = await User.findById(form.userId);
  if (!user) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }

  // Reset monthly count if needed
  const now = new Date();
  const resetDate = new Date(user.submissionResetDate);
  if (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  ) {
    user.submissionCount = 0;
    user.submissionResetDate = now;
  }

  if (user.plan === "free" && user.submissionCount >= FREE_LIMIT) {
    return NextResponse.json(
      { error: "Submission limit reached for this form." },
      { status: 429 }
    );
  }

  // Section fields are UI-only dividers — exclude from validation and sheet writes
  const submittableFields = form.fields.filter(
    (f: { type: string }) => f.type !== "section"
  );

  // Validate required fields
  for (const field of submittableFields) {
    if (field.required && !body[field.label]) {
      return NextResponse.json(
        { error: `${field.label} is required` },
        { status: 400 }
      );
    }
  }

  // Build sheet row: use sheetHeaders for correct column ordering if available,
  // otherwise fall back to field array order (backwards compatible)
  const rowValues: string[] =
    form.sheetHeaders?.length > 0
      ? form.sheetHeaders.map((header: string) => {
          const field = submittableFields.find(
            (f: { sheetColumn: string }) => f.sheetColumn === header
          );
          return field ? String(body[field.label] ?? "") : "";
        })
      : submittableFields.map((f: { label: string }) => String(body[f.label] ?? ""));
  rowValues.push(new Date().toISOString());

  try {
    await appendToSheet(user.email, form.sheetId, form.sheetName, rowValues);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to write to Google Sheets: " + msg },
      { status: 500 }
    );
  }

  // Save submission record
  await Submission.create({
    formId: params.formId,
    data: body,
    submittedAt: now,
    ipAddress: req.headers.get("x-forwarded-for") || "",
  });

  // Update counts
  user.submissionCount += 1;
  form.submissionCount += 1;
  await Promise.all([user.save(), form.save()]);

  // Email notification
  if (user.emailNotifications) {
    sendSubmissionNotification(user.email, form.title, body).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    redirectUrl: form.redirectUrl,
    thankYouMessage: form.thankYouMessage,
  });
}
