"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DayCount {
  date: string;
  count: number;
}

interface AnalyticsData {
  formTitle: string;
  sheetName: string;
  sheetId: string;
  total: number;
  viewCount: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  monthlyTotal: number;
  avgPerDay: number;
  daily: DayCount[];
}

function relativeDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function BarChart({ data }: { data: DayCount[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.count), 1);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="relative">
      {/* Bars */}
      <div className="flex items-end gap-px h-40">
        {data.map((d, i) => {
          const heightPct = Math.max((d.count / max) * 100, d.count > 0 ? 3 : 0.5);
          const isToday = d.date === today;
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={i}
              className="relative flex-1 flex items-end cursor-default"
              style={{ height: "100%" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className="w-full rounded-t-[2px] transition-opacity"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isToday
                    ? "#5b21b6"
                    : d.count > 0
                    ? "#7c3aed"
                    : "#f3f4f6",
                  opacity: isHovered ? 1 : d.count > 0 ? 0.75 : 1,
                }}
              />
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 bg-[#111111] text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none px-2.5 py-1.5">
                  <p className="text-gray-400 text-[10px] font-medium mb-0.5">{relativeDate(d.date)}</p>
                  <p className="font-bold">{d.count} submission{d.count !== 1 ? "s" : ""}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* X-axis labels — show ~5 evenly spaced */}
      <div className="flex mt-2 text-[10px] text-gray-400 font-medium">
        {data.map((d, i) => {
          const show = i === 0 || i === 6 || i === 13 || i === 20 || i === data.length - 1;
          return (
            <div key={i} className="flex-1 text-center" style={{ opacity: show ? 1 : 0 }}>
              {show ? relativeDate(d.date) : "·"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/analytics/${formId}`)
      .then((r) => r.json())
      .then((d: AnalyticsData & { error?: string }) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [status, formId]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8ff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading analytics…</p>
        </div>
      </div>
    );
  }

  const conversionRate =
    data && data.viewCount > 0
      ? ((data.total / data.viewCount) * 100).toFixed(1)
      : null;

  const STATS = data
    ? [
        {
          label: "Total views",
          value: data.viewCount.toLocaleString(),
          sub: "All time",
          icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          ),
          accent: false,
        },
        {
          label: "Total submissions",
          value: data.total.toLocaleString(),
          sub: "All time",
          icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          accent: false,
        },
        {
          label: "Conversion rate",
          value: conversionRate !== null ? `${conversionRate}%` : "—",
          sub: conversionRate !== null ? "Views → submissions" : "No views yet",
          icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 13l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          accent: conversionRate !== null && parseFloat(conversionRate) > 10,
        },
        {
          label: "Daily average",
          value: data.avgPerDay > 0 ? `${data.avgPerDay}` : "0",
          sub: "Last 30 days",
          icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="4" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M6 2v3M12 2v3M3 8h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ),
          accent: false,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#f8f8ff]">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200/80 px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 10l3-3 2.5 2.5 4.5-5.5" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm truncate">
              {data?.formTitle ?? "Analytics"}
            </span>
            {data?.sheetName && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
                {data.sheetName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/dashboard/submissions/${formId}`}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 5.5h6M4 7.5h6M4 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Submissions
            </Link>
            {data?.sheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${data.sheetId}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Open Sheet
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7.5 4.5V8M7.5 10.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {STATS.map(({ label, value, sub, icon, accent }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${accent ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-500"}`}>
                {icon}
              </div>
              <p className={`text-2xl font-extrabold tracking-tight mb-0.5 ${accent ? "text-violet-600" : "text-[#111111]"}`}>
                {value}
              </p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Chart card ── */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Submissions over time</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
            </div>
            {data && data.monthlyTotal > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {data.monthlyTotal} this month
              </div>
            )}
          </div>

          {data ? (
            <BarChart data={data.daily} />
          ) : (
            <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-violet-600 opacity-75" />
              <span className="text-xs text-gray-400">Submissions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#5b21b6]" />
              <span className="text-xs text-gray-400">Today</span>
            </div>
          </div>
        </div>

        {/* ── Period breakdown ── */}
        {data && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Today",      value: data.todayCount,  icon: "🌅" },
              { label: "This week",  value: data.weekCount,   icon: "📅" },
              { label: "This month", value: data.monthCount,  icon: "📊" },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 flex items-center gap-4"
              >
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <p className="text-2xl font-extrabold text-[#111111] tracking-tight leading-none">
                    {value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
