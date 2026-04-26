import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Form } from "@/models/Form";
import { applySheetFormatting } from "@/lib/google";

export async function POST(
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

  try {
    await applySheetFormatting(
      session.user.email,
      form.sheetId,
      form.sheetName,
      form.styling ?? {}
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to apply formatting" }, { status: 500 });
  }
}
