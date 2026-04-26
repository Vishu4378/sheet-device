import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Form } from "@/models/Form";
import { Submission } from "@/models/Submission";

interface DayBucket {
  _id: { year: number; month: number; day: number };
  count: number;
}

function buildDailyArray(daysAgo: Date, now: Date, buckets: DayBucket[]) {
  const map = new Map<string, number>();
  for (const b of buckets) {
    map.set(`${b._id.year}-${b._id.month}-${b._id.day}`, b.count);
  }
  const result: { date: string; count: number }[] = [];
  const cur = new Date(daysAgo);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    const key = `${cur.getFullYear()}-${cur.getMonth() + 1}-${cur.getDate()}`;
    result.push({ date: cur.toISOString().split("T")[0], count: map.get(key) ?? 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

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

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOf7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [dailyAgg, todayCount, weekCount, monthCount] = await Promise.all([
    Submission.aggregate<DayBucket>([
      { $match: { formId: params.formId, submittedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$submittedAt" },
            month: { $month: "$submittedAt" },
            day: { $dayOfMonth: "$submittedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),
    Submission.countDocuments({ formId: params.formId, submittedAt: { $gte: startOfToday } }),
    Submission.countDocuments({ formId: params.formId, submittedAt: { $gte: startOf7Days } }),
    Submission.countDocuments({ formId: params.formId, submittedAt: { $gte: startOfMonth } }),
  ]);

  const daily = buildDailyArray(thirtyDaysAgo, now, dailyAgg);
  const monthlyTotal = daily.reduce((s, d) => s + d.count, 0);
  const activeDays = daily.filter((d) => d.count > 0).length;

  return NextResponse.json({
    formTitle: form.title,
    sheetName: form.sheetName,
    sheetId: form.sheetId,
    total: form.submissionCount,
    viewCount: form.viewCount ?? 0,
    todayCount,
    weekCount,
    monthCount,
    monthlyTotal,
    avgPerDay: activeDays > 0 ? +(monthlyTotal / 30).toFixed(1) : 0,
    daily,
  });
}
