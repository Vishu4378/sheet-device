import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserSheets, getSheetTabs, getSheetHeaders } from "@/lib/google";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const spreadsheetId = searchParams.get("spreadsheetId");
  const sheetName = searchParams.get("sheetName");

  try {
    if (spreadsheetId && sheetName) {
      const headers = await getSheetHeaders(session.user.email, spreadsheetId, sheetName);
      return NextResponse.json({ headers });
    }
    if (spreadsheetId) {
      const tabs = await getSheetTabs(session.user.email, spreadsheetId);
      return NextResponse.json({ tabs });
    }
    const files = await getUserSheets(session.user.email);
    return NextResponse.json({ files });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
