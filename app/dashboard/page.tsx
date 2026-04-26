"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Form {
  formId: string;
  title: string;
  submissionCount: number;
  isActive: boolean;
  createdAt: string;
  sheetName: string;
  responseLimit?: number | null;
  expiryDate?: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/forms")
        .then((r) => r.json())
        .then((d) => setForms(d.forms || []))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8ff]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8ff]">
      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="w-60 min-h-screen bg-white border-r border-gray-200/80 flex flex-col fixed left-0 top-0 bottom-0 z-10">
          <div className="p-5 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-[#111111] rounded-xl flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" />
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-[15px] tracking-tight text-[#111111]">SheetForm</span>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-50 text-violet-700 font-semibold text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.8" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.4" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.4" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.8" />
              </svg>
              My Forms
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Settings
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              {session?.user?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left text-sm text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="ml-60 flex-1 p-8">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#111111]">My Forms</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {forms.length} form{forms.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link
                href="/builder"
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm shadow-violet-200"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                New Form
              </Link>
            </div>

            {forms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="4" y="4" width="9" height="9" rx="2" fill="#7c3aed" fillOpacity="0.15" />
                    <rect x="15" y="4" width="9" height="9" rx="2" fill="#7c3aed" fillOpacity="0.06" />
                    <rect x="4" y="15" width="9" height="9" rx="2" fill="#7c3aed" fillOpacity="0.06" />
                    <rect x="15" y="15" width="9" height="9" rx="2" fill="#7c3aed" fillOpacity="0.15" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No forms yet</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                  Create your first form and connect it to a Google Sheet.
                </p>
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  New Form
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {forms.map((form) => (
                  <div
                    key={form.formId}
                    className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 flex items-center justify-between hover:border-violet-200 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#7c3aed" fillOpacity="0.7" />
                          <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#7c3aed" fillOpacity="0.3" />
                          <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#7c3aed" fillOpacity="0.3" />
                          <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#7c3aed" fillOpacity="0.7" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{form.title}</h3>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                              form.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {form.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-gray-400">
                            {form.submissionCount.toLocaleString()} submission{form.submissionCount !== 1 ? "s" : ""}
                            {form.responseLimit ? ` / ${form.responseLimit.toLocaleString()}` : ""} · {form.sheetName}
                          </p>
                          {form.expiryDate && (
                            <span className="text-[11px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-medium">
                              Expires {new Date(form.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                        {form.responseLimit != null && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, (form.submissionCount / form.responseLimit) * 100)}%`,
                                  backgroundColor: form.submissionCount >= form.responseLimit ? "#dc2626" : "#7c3aed",
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">
                              {Math.round((form.submissionCount / form.responseLimit) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-4">
                      <Link
                        href={`/dashboard/analytics/${form.formId}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M1 9l2.5-2.5 2 2L9 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Analytics
                      </Link>
                      <Link
                        href={`/dashboard/submissions/${form.formId}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Submissions
                        {form.submissionCount > 0 && (
                          <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                            {form.submissionCount > 999 ? "999+" : form.submissionCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href={`/f/${form.formId}`}
                        target="_blank"
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/builder?edit=${form.formId}`}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/sheet/${form.formId}`}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Sheet
                      </Link>
                      <Link
                        href={`/settings?form=${form.formId}`}
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
