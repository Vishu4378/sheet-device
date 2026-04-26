"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface Form {
  formId: string;
  title: string;
  isActive: boolean;
  submissionCount: number;
}

function SettingsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formIdParam = searchParams.get("form");

  const [forms, setForms]               = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [msg, setMsg]                   = useState("");
  const [emailNotif, setEmailNotif]     = useState(true);
  const [savingNotif, setSavingNotif]   = useState(false);
  const [reformatting, setReformatting] = useState(false);
  const [reformatMsg, setReformatMsg]   = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/forms")
      .then((r) => r.json())
      .then((d) => {
        setForms(d.forms || []);
        if (formIdParam) {
          const f = (d.forms || []).find((x: Form) => x.formId === formIdParam);
          if (f) setSelectedForm(f);
        }
      });
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.emailNotifications === "boolean") setEmailNotif(d.emailNotifications);
      });
  }, [status, formIdParam]);

  const flash = (setter: (s: string) => void, msg: string) => {
    setter(msg);
    setTimeout(() => setter(""), 2500);
  };

  const toggleEmailNotif = async () => {
    const next = !emailNotif;
    setEmailNotif(next);
    setSavingNotif(true);
    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications: next }),
      });
    } catch {
      setEmailNotif(!next);
    } finally {
      setSavingNotif(false);
    }
  };

  const toggleActive = async () => {
    if (!selectedForm) return;
    setSaving(true);
    const res = await fetch(`/api/forms/${selectedForm.formId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !selectedForm.isActive }),
    });
    const d = await res.json();
    setSelectedForm(d.form);
    setForms((prev) => prev.map((f) => (f.formId === d.form.formId ? d.form : f)));
    setSaving(false);
    flash(setMsg, "Saved!");
  };

  const reformatSheet = async () => {
    if (!selectedForm) return;
    setReformatting(true);
    try {
      const res = await fetch(`/api/forms/${selectedForm.formId}/format`, { method: "POST" });
      if (!res.ok) throw new Error();
      flash(setReformatMsg, "✓ Sheet reformatted");
    } catch {
      flash(setReformatMsg, "Failed to reformat");
    } finally {
      setReformatting(false);
    }
  };

  const deleteForm = async () => {
    if (!selectedForm) return;
    if (!confirm(`Delete "${selectedForm.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/forms/${selectedForm.formId}`, { method: "DELETE" });
    setForms((prev) => prev.filter((f) => f.formId !== selectedForm.formId));
    setSelectedForm(null);
    setDeleting(false);
  };

  if (status === "loading") {
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors"
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-50 text-violet-700 font-semibold text-sm"
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
                <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm" referrerPolicy="no-referrer" />
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
          <div className="max-w-3xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#111111]">Settings</h1>
              <p className="text-gray-400 text-sm mt-1">Manage your forms and account preferences.</p>
            </div>

            {/* Form selector */}
            {forms.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 mb-5">
                <h2 className="font-semibold text-gray-900 text-sm mb-3">Select a Form</h2>
                <div className="space-y-2">
                  {forms.map((f) => (
                    <button
                      key={f.formId}
                      onClick={() => setSelectedForm(f)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                        selectedForm?.formId === f.formId
                          ? "border-violet-400 bg-violet-50 text-violet-700"
                          : "border-gray-200 hover:border-violet-200 text-gray-700 hover:bg-gray-50/50"
                      }`}
                    >
                      <span className="font-medium">{f.title}</span>
                      <span className="ml-2 text-gray-400 text-xs">
                        {f.submissionCount} submission{f.submissionCount !== 1 ? "s" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form settings */}
            {selectedForm && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
                  <h2 className="font-bold text-gray-500 mb-5 text-sm uppercase tracking-wide">Form Settings</h2>

                  {msg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-2.5 mb-4">
                      {msg}
                    </div>
                  )}

                  {/* Active toggle */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Accepting Submissions</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selectedForm.isActive ? "Form is live and accepting responses" : "Form is paused — no new submissions"}
                      </p>
                    </div>
                    <button
                      onClick={toggleActive}
                      disabled={saving}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
                        selectedForm.isActive ? "bg-violet-600" : "bg-gray-200"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${selectedForm.isActive ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>

                  {/* Email notifications */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
                      <p className="text-xs text-gray-400 mt-0.5">Receive an email for each new submission</p>
                    </div>
                    <button
                      onClick={toggleEmailNotif}
                      disabled={savingNotif}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
                        emailNotif ? "bg-violet-600" : "bg-gray-200"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${emailNotif ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>

                  {/* Form URL */}
                  <div className="pt-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Form URL</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-50 text-gray-600 text-xs px-3 py-2.5 rounded-xl border border-gray-200 truncate">
                        {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/f/{selectedForm.formId}
                      </code>
                      <Link
                        href={`/f/${selectedForm.formId}`}
                        target="_blank"
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700 whitespace-nowrap px-3 py-2 border border-violet-200 rounded-xl hover:bg-violet-50 transition-colors"
                      >
                        Open →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Sheet Formatting */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="1" y="1" width="12" height="12" rx="2" stroke="#059669" strokeWidth="1.3" />
                            <path d="M1 5h12M5 5v8" stroke="#059669" strokeWidth="1.3" />
                          </svg>
                        </div>
                        <h2 className="font-bold text-gray-900 text-sm">Sheet Formatting</h2>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mt-1">
                        Re-apply your header colors, frozen row, column widths, and alternating row colors to your Google Sheet.
                        Useful if you&apos;ve manually edited the sheet and want to restore the original styling.
                      </p>
                      {reformatMsg && (
                        <p className={`text-xs mt-2 font-semibold ${reformatMsg.startsWith("✓") ? "text-emerald-600" : "text-red-600"}`}>
                          {reformatMsg}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={reformatSheet}
                      disabled={reformatting}
                      className="flex-shrink-0 flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      {reformatting ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M1.5 6.5C1.5 3.74 3.74 1.5 6.5 1.5c1.5 0 2.84.64 3.77 1.67M11.5 6.5C11.5 9.26 9.26 11.5 6.5 11.5c-1.5 0-2.84-.64-3.77-1.67" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                          <path d="M9.5 1l1 2.17L8.5 3.5M4 9.5l-1 2.17L5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {reformatting ? "Reformatting…" : "Reformat Sheet"}
                    </button>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="bg-white rounded-2xl border border-red-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
                  <h2 className="font-bold text-red-600 mb-4 text-sm">Danger Zone</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Delete Form</p>
                      <p className="text-xs text-gray-400 mt-0.5">Permanently remove this form and all its settings. Cannot be undone.</p>
                    </div>
                    <button
                      onClick={deleteForm}
                      disabled={deleting}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      {deleting ? "Deleting…" : "Delete Form"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {forms.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm mb-4">No forms yet.</p>
                <Link
                  href="/builder"
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Create your first form
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8ff]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
