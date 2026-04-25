"use client";

import { useEffect, useState } from "react";
import { FormData } from "@/app/builder/page";

interface Props {
  formData: FormData;
  update: (partial: Partial<FormData>) => void;
  onNext: () => void;
}

interface Sheet {
  id: string;
  name: string;
}

export default function StepConnectSheet({ formData, update, onNext }: Props) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(true);
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [loadingHeaders, setLoadingHeaders] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/sheets")
      .then((r) => r.json())
      .then((d: { files?: Sheet[] }) => setSheets(d.files || []))
      .catch(() => setError("Failed to fetch Google Sheets. Make sure you granted access."))
      .finally(() => setLoadingSheets(false));
  }, []);

  const selectSheet = async (id: string, name: string) => {
    update({ sheetId: id, sheetTitle: name, sheetName: "", headers: [], fields: [] });
    setLoadingTabs(true);
    try {
      const res = await fetch(`/api/sheets?spreadsheetId=${id}`);
      const d = (await res.json()) as { tabs?: string[] };
      setTabs(d.tabs || []);
    } catch {
      setError("Failed to fetch sheet tabs.");
    } finally {
      setLoadingTabs(false);
    }
  };

  const selectTab = async (tab: string) => {
    update({ sheetName: tab, headers: [], fields: [] });
    setLoadingHeaders(true);
    try {
      const res = await fetch(
        `/api/sheets?spreadsheetId=${formData.sheetId}&sheetName=${encodeURIComponent(tab)}`
      );
      const d = (await res.json()) as { headers?: string[] };
      update({ sheetName: tab, headers: d.headers || [] });
    } catch {
      // headers stay empty — fallback to manual column entry in step 2
    } finally {
      setLoadingHeaders(false);
    }
  };

  const canContinue = !!formData.sheetId && !!formData.sheetName;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Connect a Google Sheet</h2>
        <p className="text-gray-500 text-sm">
          Choose which spreadsheet and tab will store your form submissions.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7 4V7.5M7 9.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      {loadingSheets ? (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
          <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading your Google Sheets…</p>
        </div>
      ) : (
        <>
          {/* Spreadsheet picker */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Spreadsheet
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
              {sheets.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm font-medium text-gray-500">No spreadsheets found</p>
                  <p className="text-xs mt-1 text-gray-400">
                    Create one in Google Sheets, then refresh.
                  </p>
                </div>
              ) : (
                sheets.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => void selectSheet(s.id, s.name)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm flex items-center gap-3 ${
                      formData.sheetId === s.id
                        ? "border-violet-500 bg-violet-50 shadow-sm"
                        : "border-gray-200 hover:border-violet-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="text-base flex-shrink-0">📊</span>
                    <span
                      className={`font-medium truncate ${
                        formData.sheetId === s.id ? "text-violet-800" : ""
                      }`}
                    >
                      {s.name}
                    </span>
                    {formData.sheetId === s.id && (
                      <svg
                        className="ml-auto flex-shrink-0"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <circle cx="9" cy="9" r="8" fill="#7c3aed" />
                        <path
                          d="M5 9L7.5 11.5L13 6"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Tab picker */}
          {formData.sheetId && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Sheet Tab
              </label>
              {loadingTabs ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  Loading tabs…
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => void selectTab(tab)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        formData.sheetName === tab
                          ? "border-violet-500 bg-violet-600 text-white shadow-sm"
                          : "border-gray-200 hover:border-violet-300 text-gray-600 bg-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Header detection feedback */}
          {formData.sheetName && (
            <div className="mb-5">
              {loadingHeaders ? (
                <div className="flex items-center gap-2 text-gray-400 text-xs bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Reading column headers from row 1…
                </div>
              ) : formData.headers.length > 0 ? (
                <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
                  <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="7.5" r="6.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.2" />
                    <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    Detected{" "}
                    <strong>{formData.headers.length}</strong>{" "}
                    column{formData.headers.length !== 1 ? "s" : ""}:{" "}
                    <span className="font-medium">{formData.headers.join(", ")}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 1.5L13.5 13H1.5L7.5 1.5Z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.2" />
                    <path d="M7.5 6V9M7.5 11V11.5" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <span>
                    No headers found in row 1. You can add column headers to your sheet first, or map
                    fields manually in the next step.
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex justify-end pt-5 border-t border-gray-100">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
        >
          Next: Add Fields
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
