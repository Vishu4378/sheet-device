"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface Submission {
  _id: string;
  data: Record<string, string>;
  submittedAt: string;
  ipAddress?: string;
}

interface SubmissionsData {
  submissions: Submission[];
  total: number;
  todayCount: number;
  weekCount: number;
  page: number;
  pages: number;
  fields: string[];
  formTitle: string;
  sheetName: string;
  sheetId: string;
}

type DateFilter = "all" | "today" | "7d" | "30d";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function sinceParam(filter: DateFilter): string | null {
  if (filter === "all") return null;
  const now = new Date();
  if (filter === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const days = filter === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function getPaginationItems(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, null, total];
  if (current >= total - 3) return [1, null, total - 4, total - 3, total - 2, total - 1, total];
  return [1, null, current - 1, current, current + 1, null, total];
}

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "All time", value: "all" },
  { label: "Today",    value: "today" },
  { label: "7 days",   value: "7d" },
  { label: "30 days",  value: "30d" },
];

export default function SubmissionsPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  const [data, setData]           = useState<SubmissionsData | null>(null);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [selected, setSelected]   = useState<Submission | null>(null);
  const [search, setSearch]       = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    setPage(1);
  }, [dateFilter]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    const since = sinceParam(dateFilter);
    const url = `/api/submissions/${formId}?page=${page}${since ? `&since=${encodeURIComponent(since)}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((d: SubmissionsData & { error?: string }) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [status, formId, page, dateFilter]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data.submissions;
    const q = search.toLowerCase();
    return data.submissions.filter((s) =>
      Object.values(s.data).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, search]);

  const handleExport = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const r = await fetch(`/api/submissions/${formId}?export=1`);
      const d = (await r.json()) as SubmissionsData;
      const headers = ["Submitted At", ...d.fields];
      const rows = d.submissions.map((s) => [
        new Date(s.submittedAt).toISOString(),
        ...d.fields.map((f) => `"${String(s.data[f] ?? "").replace(/"/g, '""')}"`),
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `submissions-${formId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  if (status === "loading" || (loading && !data)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8ff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading submissions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8ff]">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200/80 px-6 py-3.5">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
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

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {data?.formTitle ?? "Submissions"}
              </span>
              {data?.sheetName && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  {data.sheetName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
            <button
              onClick={handleExport}
              disabled={exporting || !data?.total}
              className="flex items-center gap-1.5 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5v7M4 6l3 3 3-3M2 10.5v1A.5.5 0 002.5 12h9a.5.5 0 00.5-.5v-1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* ── Stats strip ── */}
        {data && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total submissions", value: data.total,      accent: false },
              { label: "Today",             value: data.todayCount, accent: data.todayCount > 0 },
              { label: "This week",         value: data.weekCount,  accent: false },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4"
              >
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-3xl font-extrabold tracking-tight ${accent ? "text-violet-600" : "text-[#111111]"}`}>
                  {value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search responses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {DATE_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDateFilter(value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  dateFilter === value
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7.5 4.5V8M7.5 10.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Loading overlay (page change) ── */}
        {loading && data ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          /* ── Empty state ── */
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center py-20 px-8">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="6" width="20" height="16" rx="2" stroke="#d1d5db" strokeWidth="1.5" />
                <path d="M4 11h20M9 11v11" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1.5">
              {search
                ? "No matching responses"
                : data?.total === 0
                ? "No submissions yet"
                : "Nothing in this period"}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
              {search
                ? "Try a different search term."
                : data?.total === 0
                ? "Share your form link to start collecting responses."
                : "Try selecting a wider date range."}
            </p>
          </div>
        ) : (
          /* ── Table ── */
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-32">
                      Submitted
                    </th>
                    {data?.fields.map((col) => (
                      <th key={col} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub, i) => (
                    <tr
                      key={sub._id}
                      onClick={() => setSelected(sub)}
                      className={`border-b border-gray-50 last:border-0 cursor-pointer transition-colors hover:bg-violet-50/40 ${
                        selected?._id === sub._id
                          ? "bg-violet-50/70"
                          : i % 2 !== 0
                          ? "bg-gray-50/30"
                          : ""
                      }`}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className="text-xs font-medium text-gray-500"
                          title={new Date(sub.submittedAt).toLocaleString()}
                        >
                          {relativeTime(sub.submittedAt)}
                        </span>
                      </td>
                      {data?.fields.map((col) => (
                        <td key={col} className="px-5 py-3.5 text-gray-800 max-w-[200px] truncate">
                          {String(sub.data[col] ?? "")}
                        </td>
                      ))}
                      <td className="px-4 py-3.5">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-300">
                          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <p className="text-sm text-gray-400">
              {((data.page - 1) * 50) + 1}–{Math.min(data.page * 50, data.total)} of {data.total.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={data.page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Prev
              </button>

              {getPaginationItems(data.page, data.pages).map((p, idx) =>
                p === null ? (
                  <span key={`ellipsis-${idx}`} className="w-8 text-center text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors font-medium ${
                      p === data.page
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={data.page === data.pages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail slide-over ── */}
      {selected && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          />
          <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white border-l border-gray-200 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Response detail</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {relativeTime(selected.submittedAt)} ·{" "}
                  {new Date(selected.submittedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {data?.fields.map((field) => {
                const val = String(selected.data[field] ?? "");
                return (
                  <div key={field}>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {field}
                    </p>
                    <p className={`text-sm leading-relaxed break-words ${val ? "text-gray-900" : "text-gray-300 italic"}`}>
                      {val || "—"}
                    </p>
                  </div>
                );
              })}
            </div>

            {selected.ipAddress && (
              <div className="px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">IP: {selected.ipAddress}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
