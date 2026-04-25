import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    emailNotifications: user.emailNotifications,
    plan: user.plan,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  if (typeof body.emailNotifications === "boolean") {
    allowed.emailNotifications = body.emailNotifications;
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: allowed },
    { new: true }
  );

  return NextResponse.json({ emailNotifications: user?.emailNotifications });
}
