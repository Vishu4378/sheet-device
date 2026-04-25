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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex">
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm"
            >
              <span>📋</span> My Forms
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
            >
              <span>⚙️</span> Settings
            </Link>
          </nav>
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              {session?.user?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="ml-60 flex-1 p-8">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Forms</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {forms.length} form{forms.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link
                href="/builder"
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                <span>+</span> New Form
              </Link>
            </div>

            {forms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="font-semibold text-gray-900 mb-2">No forms yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Create your first form and connect it to a Google Sheet.
                </p>
                <Link
                  href="/builder"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
                >
                  + New Form
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {forms.map((form) => (
                  <div
                    key={form.formId}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{form.title}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            form.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {form.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {form.submissionCount} submission
                        {form.submissionCount !== 1 ? "s" : ""} · Sheet: {form.sheetName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/submissions/${form.formId}`}
                        className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Submissions
                        {form.submissionCount > 0 && (
                          <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
                            {form.submissionCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href={`/f/${form.formId}`}
                        target="_blank"
                        className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/builder?edit=${form.formId}`}
                        className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/sheet/${form.formId}`}
                        className="text-sm text-violet-600 hover:text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors"
                      >
                        Sheet
                      </Link>
                      <Link
                        href={`/settings?form=${form.formId}`}
                        className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
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
