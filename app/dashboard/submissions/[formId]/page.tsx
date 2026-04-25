"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  page: number;
  pages: number;
  fields: string[];
}

export default function SubmissionsPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  const [data, setData] = useState<SubmissionsData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch(`/api/submissions/${formId}?page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load submissions"))
      .finally(() => setLoading(false));
  }, [status, formId, page]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
            >
              <span>⚙️</span> Settings
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="ml-60 flex-1 p-8">
          <div className="max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
                {data && (
                  <p className="text-gray-500 text-sm mt-0.5">
                    {data.total} total submission{data.total !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                {error}
              </div>
            )}

            {data?.submissions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="font-semibold text-gray-900 mb-1">No submissions yet</h3>
                <p className="text-gray-500 text-sm">
                  Share your form link to start collecting responses.
                </p>
              </div>
            ) : data ? (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                            Submitted At
                          </th>
                          {data.fields.map((col) => (
                            <th
                              key={col}
                              className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.submissions.map((sub, i) => (
                          <tr
                            key={sub._id}
                            className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                              i % 2 === 0 ? "" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                              {new Date(sub.submittedAt).toLocaleString()}
                            </td>
                            {data.fields.map((col) => (
                              <td key={col} className="px-4 py-3 text-gray-800 max-w-xs truncate">
                                {String(sub.data[col] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {data.pages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Page {data.page} of {data.pages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => p - 1)}
                        disabled={data.page === 1}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={data.page === data.pages}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
