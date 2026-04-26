import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Form } from "@/models/Form";

export async function POST(
  _req: NextRequest,
  { params }: { params: { formId: string } }
) {
  await connectDB();
  await Form.updateOne(
    { formId: params.formId, isActive: true },
    { $inc: { viewCount: 1 } }
  );
  return NextResponse.json({ success: true });
}
