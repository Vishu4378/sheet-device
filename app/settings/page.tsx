"use client";

import { useSession } from "next-auth/react";
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
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formIdParam = searchParams.get("form");

  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");
  const [emailNotif, setEmailNotif] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);

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
        if (typeof d.emailNotifications === "boolean") {
          setEmailNotif(d.emailNotifications);
        }
      });
  }, [status, formIdParam]);

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
      setEmailNotif(!next); // revert on failure
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
    setForms((prev) =>
      prev.map((f) => (f.formId === d.form.formId ? d.form : f))
    );
    setSaving(false);
    setMsg("Saved!");
    setTimeout(() => setMsg(""), 2000);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 bottom-0">
          <div className="p-5 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-gray-900">SheetForm</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
            >
              <span>📋</span> My Forms
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm"
            >
              <span>⚙️</span> Settings
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="ml-60 flex-1 p-8">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

            {/* Form selector */}
            {forms.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-3">Select a Form</h2>
                <div className="space-y-2">
                  {forms.map((f) => (
                    <button
                      key={f.formId}
                      onClick={() => setSelectedForm(f)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                        selectedForm?.formId === f.formId
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <span className="font-medium">{f.title}</span>
                      <span className="ml-2 text-gray-400">
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
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-900 mb-4">Form Settings</h2>

                  {msg && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-2.5 mb-4">
                      {msg}
                    </div>
                  )}

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Form Active</p>
                      <p className="text-xs text-gray-500">
                        {selectedForm.isActive
                          ? "Form is accepting submissions"
                          : "Form is paused"}
                      </p>
                    </div>
                    <button
                      onClick={toggleActive}
                      disabled={saving}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        selectedForm.isActive ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          selectedForm.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Email Notifications
                      </p>
                      <p className="text-xs text-gray-500">
                        Receive an email for each new submission
                      </p>
                    </div>
                    <button
                      onClick={toggleEmailNotif}
                      disabled={savingNotif}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
                        emailNotif ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailNotif ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">Form URL</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-50 text-gray-700 text-xs px-3 py-2 rounded-lg border border-gray-200">
                        {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/f/
                        {selectedForm.formId}
                      </code>
                      <Link
                        href={`/f/${selectedForm.formId}`}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                      >
                        Open →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
                  <h2 className="font-semibold text-red-700 mb-3">Danger Zone</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delete Form</p>
                      <p className="text-xs text-gray-500">
                        Permanently delete this form. This cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={deleteForm}
                      disabled={deleting}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                      {deleting ? "Deleting..." : "Delete Form"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {forms.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500 text-sm mb-4">No forms yet.</p>
                <Link
                  href="/builder"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-xl text-sm"
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SettingsContent />
    </Suspense>
  );
}
