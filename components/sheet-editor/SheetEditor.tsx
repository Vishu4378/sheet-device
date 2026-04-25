"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { IStyling } from "@/models/Form";

interface SheetEditorProps {
  formId: string;
  formTitle: string;
  initialHeaders: string[];
  initialStyling?: IStyling;
}

type Alignment = "LEFT" | "CENTER" | "RIGHT";

interface ThemeConfig {
  name: string;
  description: string;
  headerBgColor: string;
  headerTextColor: string;
  boldHeader: boolean;
  headerItalic: boolean;
  headerAlignment: Alignment;
  freezeHeader: boolean;
  enableBanding: boolean;
  oddRowColor: string;
  evenRowColor: string;
  autoResizeColumns: boolean;
}

const THEMES: ThemeConfig[] = [
  {
    name: "Minimal",
    description: "Simple & clean",
    headerBgColor: "#f8fafc",
    headerTextColor: "#1e293b",
    boldHeader: true,
    headerItalic: false,
    headerAlignment: "LEFT",
    freezeHeader: true,
    enableBanding: false,
    oddRowColor: "#f9fafb",
    evenRowColor: "#ffffff",
    autoResizeColumns: true,
  },
  {
    name: "Clean",
    description: "Soft gray, zebra rows",
    headerBgColor: "#f1f5f9",
    headerTextColor: "#334155",
    boldHeader: true,
    headerItalic: false,
    headerAlignment: "LEFT",
    freezeHeader: true,
    enableBanding: true,
    oddRowColor: "#f8fafc",
    evenRowColor: "#ffffff",
    autoResizeColumns: true,
  },
  {
    name: "Professional",
    description: "Violet header",
    headerBgColor: "#7c3aed",
    headerTextColor: "#ffffff",
    boldHeader: true,
    headerItalic: false,
    headerAlignment: "CENTER",
    freezeHeader: true,
    enableBanding: true,
    oddRowColor: "#f5f3ff",
    evenRowColor: "#ffffff",
    autoResizeColumns: true,
  },
  {
    name: "Midnight",
    description: "Dark & elegant",
    headerBgColor: "#1e1b4b",
    headerTextColor: "#c4b5fd",
    boldHeader: true,
    headerItalic: false,
    headerAlignment: "CENTER",
    freezeHeader: true,
    enableBanding: true,
    oddRowColor: "#eef2ff",
    evenRowColor: "#ffffff",
    autoResizeColumns: true,
  },
];

const BG_PRESETS = [
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0",
  "#f5f3ff", "#ede9fe", "#dbeafe", "#dcfce7",
  "#fef9c3", "#7c3aed", "#1e40af", "#111827",
];

const TEXT_PRESETS = [
  "#111827", "#374151", "#6b7280",
  "#7c3aed", "#1d4ed8", "#065f46",
  "#ffffff", "#f5f3ff", "#bfdbfe", "#fbbf24",
];

const ROW_PRESETS = [
  "#ffffff", "#f9fafb", "#f3f4f6",
  "#f5f3ff", "#eff6ff", "#f0fdf4",
  "#fefce8", "#ede9fe", "#dbeafe", "#dcfce7",
];

// ─── Sub-components ──────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
        value ? "bg-violet-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function ColorSwatch({
  hex,
  selected,
  onSelect,
}: {
  hex: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const isVeryLight =
    hex === "#ffffff" || hex === "#f8fafc" || hex === "#f1f5f9" || hex === "#e2e8f0";
  return (
    <button
      type="button"
      title={hex}
      onClick={onSelect}
      className={`relative w-8 h-8 rounded-lg flex-shrink-0 transition-all ${
        selected ? "ring-2 ring-violet-600 ring-offset-2 scale-110 shadow-sm" : "hover:scale-105"
      }`}
      style={{
        backgroundColor: hex,
        border: isVeryLight ? "1px solid #e5e7eb" : "none",
      }}
    >
      {selected && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              isVeryLight ? "bg-violet-600" : "bg-white/30"
            }`}
          >
            {/* checkmark */}
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path
                d="M1.5 4.5L3.5 6.5L7.5 2"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      )}
    </button>
  );
}

function AlignmentPicker({
  value,
  onChange,
}: {
  value: Alignment;
  onChange: (v: Alignment) => void;
}) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
      {(["LEFT", "CENTER", "RIGHT"] as Alignment[]).map((val) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            value === val
              ? "bg-violet-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {val === "LEFT" ? "Left" : val === "CENTER" ? "Center" : "Right"}
        </button>
      ))}
    </div>
  );
}

function ThemeCard({
  theme,
  selected,
  onClick,
}: {
  theme: ThemeConfig;
  selected: boolean;
  onClick: () => void;
}) {
  const rows = theme.enableBanding
    ? [theme.oddRowColor, theme.evenRowColor, theme.oddRowColor]
    : ["#ffffff", "#ffffff", "#ffffff"];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-xl border-2 overflow-hidden transition-all text-left ${
        selected
          ? "border-violet-600 shadow-md shadow-violet-100"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="w-full">
        <div
          className="h-6 flex items-center gap-1 px-2"
          style={{ backgroundColor: theme.headerBgColor }}
        >
          {[0.7, 0.5, 0.8].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-sm"
              style={{
                backgroundColor: theme.headerTextColor,
                opacity: theme.boldHeader ? 0.85 : 0.55,
                width: `${w * 100}%`,
              }}
            />
          ))}
        </div>
        {rows.map((color, i) => (
          <div
            key={i}
            className="h-4 flex items-center px-2"
            style={{ backgroundColor: color }}
          >
            <div className="h-1.5 rounded-sm bg-gray-300 opacity-60 w-3/4" />
          </div>
        ))}
      </div>
      <div className="px-2.5 py-2 bg-white border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-900">{theme.name}</p>
        <p className="text-xs text-gray-400 leading-tight mt-0.5">{theme.description}</p>
      </div>
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center shadow-sm pointer-events-none">
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path
              d="M1.5 4.5L3.5 6.5L7.5 2"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────

export default function SheetEditor({ formId, formTitle, initialHeaders, initialStyling }: SheetEditorProps) {
  // ── Header state ──
  const [headers, setHeaders] = useState<string[]>(initialHeaders);
  const [headerSaving, setHeaderSaving] = useState(false);
  const [headerSaved, setHeaderSaved] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // ── Formatting state — seeded from DB if previously saved ──
  const [headerBgColor, setHeaderBgColor] = useState(initialStyling?.headerBgColor ?? "#f8fafc");
  const [headerTextColor, setHeaderTextColor] = useState(initialStyling?.headerTextColor ?? "#1e293b");
  const [boldHeader, setBoldHeader] = useState(initialStyling?.boldHeader ?? true);
  const [headerItalic, setHeaderItalic] = useState(initialStyling?.headerItalic ?? false);
  const [headerAlignment, setHeaderAlignment] = useState<Alignment>(initialStyling?.headerAlignment ?? "LEFT");
  const [freezeHeader, setFreezeHeader] = useState(initialStyling?.freezeHeader ?? true);
  const [enableBanding, setEnableBanding] = useState(initialStyling?.enableBanding ?? false);
  const [oddRowColor, setOddRowColor] = useState(initialStyling?.oddRowColor ?? "#f8fafc");
  const [evenRowColor, setEvenRowColor] = useState(initialStyling?.evenRowColor ?? "#ffffff");
  const [autoResizeColumns, setAutoResizeColumns] = useState(initialStyling?.autoResizeColumns ?? true);

  // ── UI state ──
  const [activeTheme, setActiveTheme] = useState(() => {
    if (!initialStyling) return "Minimal";
    const match = THEMES.find(
      (t) =>
        t.headerBgColor === initialStyling.headerBgColor &&
        t.headerTextColor === initialStyling.headerTextColor &&
        t.enableBanding === initialStyling.enableBanding
    );
    return match?.name ?? "Custom";
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(type: "success" | "error", msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, msg });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }

  // ── Load live headers from the sheet ──
  useEffect(() => {
    fetch(`/api/sheets/manage?formId=${formId}`)
      .then((r) => r.json())
      .then((d: { headers?: string[] }) => {
        if (Array.isArray(d.headers) && d.headers.length > 0) setHeaders(d.headers);
      })
      .catch(() => {/* keep initialHeaders */})
      .finally(() => setLoading(false));
  }, [formId]);

  // ── Auto-save headers to sheet + MongoDB ──
  async function saveHeaders(newHeaders: string[]) {
    setHeaderSaving(true);
    setHeaderSaved(false);
    try {
      const res = await fetch("/api/sheets/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, headers: newHeaders.filter(Boolean) }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error ?? "Save failed");
      }
      setHeaderSaved(true);
      setTimeout(() => setHeaderSaved(false), 2500);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save column changes");
    } finally {
      setHeaderSaving(false);
    }
  }

  // ── Header editing ──
  function startEdit(i: number, val: string) {
    setEditingIndex(i);
    setEditValue(val);
  }

  function commitEdit(i: number) {
    const trimmed = editValue.trim();
    const newHeaders = trimmed
      ? headers.map((h, idx) => (idx === i ? trimmed : h))
      : headers.filter((_, idx) => idx !== i);
    setHeaders(newHeaders);
    setEditingIndex(null);
    setEditValue("");
    void saveHeaders(newHeaders);
  }

  // Using a ref to carry the latest headers so the click handler
  // always sees the post-blur state (avoids stale closure on concurrent blur+click).
  const headersRef = useRef(headers);
  useEffect(() => { headersRef.current = headers; }, [headers]);

  function removeHeader(i: number) {
    // Read from ref so we get the value AFTER any concurrent commitEdit may have run
    const latest = headersRef.current;
    const newHeaders = latest.filter((_, idx) => idx !== i);
    setHeaders(newHeaders);
    setEditingIndex(null);
    setEditValue("");
    void saveHeaders(newHeaders);
  }

  function addHeader() {
    // Don't save yet — saveHeaders is called in commitEdit when the user finishes typing
    const idx = headers.length;
    setHeaders((prev) => [...prev, "New Column"]);
    setEditingIndex(idx);
    setEditValue("New Column");
  }

  // ── Themes ──
  function applyTheme(theme: ThemeConfig) {
    setActiveTheme(theme.name);
    setHeaderBgColor(theme.headerBgColor);
    setHeaderTextColor(theme.headerTextColor);
    setBoldHeader(theme.boldHeader);
    setHeaderItalic(theme.headerItalic);
    setHeaderAlignment(theme.headerAlignment);
    setFreezeHeader(theme.freezeHeader);
    setEnableBanding(theme.enableBanding);
    setOddRowColor(theme.oddRowColor);
    setEvenRowColor(theme.evenRowColor);
    setAutoResizeColumns(theme.autoResizeColumns);
  }

  // ── Apply formatting to Google Sheet ──
  async function handleApplyFormatting() {
    setSaving(true);
    try {
      const res = await fetch("/api/sheets/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          // Include current headers so they stay in sync
          headers: headers.filter(Boolean),
          headerBgColor,
          headerTextColor,
          boldHeader,
          headerItalic,
          headerAlignment,
          freezeHeader,
          enableBanding,
          oddRowColor,
          evenRowColor,
          autoResizeColumns,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      showToast("success", "Formatting applied to your Google Sheet!");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading screen ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading your sheet…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm max-w-xs border ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span className="mt-0.5 flex-shrink-0">{toast.type === "success" ? "✓" : "✕"}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/dashboard"
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
            >
              ← Back
            </Link>
            <span className="text-gray-300 flex-shrink-0">/</span>
            <span className="text-sm font-semibold text-gray-900 truncate">{formTitle}</span>
          </div>
          <button
            type="button"
            onClick={handleApplyFormatting}
            disabled={saving}
            className="flex-shrink-0 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? "Applying…" : "Apply Formatting"}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-16">
        {/* Page intro */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sheet Editor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Column changes{" "}
            <span className="font-medium text-gray-700">save automatically</span>.{" "}
            Use{" "}
            <span className="font-medium text-violet-700">Apply Formatting</span>{" "}
            to push colours, fonts, and row styles to your Google Sheet.
          </p>
        </div>

        {/* ── Quick Themes ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">Quick Themes</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              One click to apply a complete look — tweak anything below afterwards
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {THEMES.map((theme) => (
              <ThemeCard
                key={theme.name}
                theme={theme}
                selected={activeTheme === theme.name}
                onClick={() => applyTheme(theme)}
              />
            ))}
          </div>
        </section>

        {/* ── Column Headers ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-gray-900">Column Headers</h2>
            {headerSaving && (
              <span className="text-xs text-gray-400 animate-pulse">Saving…</span>
            )}
            {!headerSaving && headerSaved && (
              <span className="text-xs text-green-600 font-medium">Saved ✓</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Click a label to rename · tap{" "}
            <span className="font-semibold text-red-400">✕</span> to remove ·
            changes are saved to your sheet immediately
          </p>

          <div className="flex flex-wrap gap-2">
            {headers.map((header, i) => (
              <div
                key={i}
                className={`flex items-center rounded-full border transition-all ${
                  editingIndex === i
                    ? "bg-white border-violet-400 ring-2 ring-violet-100"
                    : "bg-violet-50 border-violet-200 hover:border-violet-300"
                }`}
              >
                {/* Label / edit input */}
                <div className="pl-3 pr-1">
                  {editingIndex === i ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(i);
                        if (e.key === "Escape") {
                          setEditingIndex(null);
                          setEditValue("");
                        }
                      }}
                      className="bg-transparent text-sm font-medium text-violet-900 outline-none w-28 min-w-0 py-1.5"
                    />
                  ) : (
                    <span
                      className="block text-sm font-medium text-violet-900 cursor-text select-none py-1.5"
                      onClick={() => startEdit(i, header)}
                      title="Click to rename"
                    >
                      {header || (
                        <span className="text-violet-400 italic text-xs">untitled</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Delete button — IMPORTANT: pointer-events-none on SVG so click always hits the <button> */}
                <button
                  type="button"
                  onClick={() => removeHeader(i)}
                  className="mr-1.5 w-6 h-6 flex items-center justify-center rounded-full text-violet-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                  aria-label={`Remove column "${header}"`}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    style={{ pointerEvents: "none" }}
                  >
                    <path
                      d="M8.5 1.5L1.5 8.5M1.5 1.5L8.5 8.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addHeader}
              className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-800 border border-dashed border-violet-300 hover:border-violet-500 hover:bg-violet-50 rounded-full px-3 py-1.5 transition-all"
            >
              <span className="text-base leading-none">+</span>
              Add column
            </button>
          </div>
        </section>

        {/* ── Header Row Style ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-5">Header Row Style</h2>

          <div className="space-y-6">
            {/* Background color */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-0.5">Background color</p>
              <p className="text-xs text-gray-400 mb-3">Fill color of the header row</p>
              <div className="flex flex-wrap gap-2">
                {BG_PRESETS.map((hex) => (
                  <ColorSwatch
                    key={hex}
                    hex={hex}
                    selected={headerBgColor === hex}
                    onSelect={() => {
                      setHeaderBgColor(hex);
                      setActiveTheme("");
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Text color */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-0.5">Text color</p>
              <p className="text-xs text-gray-400 mb-3">
                Pick white or light colors for dark backgrounds
              </p>
              <div className="flex flex-wrap gap-2">
                {TEXT_PRESETS.map((hex) => (
                  <ColorSwatch
                    key={hex}
                    hex={hex}
                    selected={headerTextColor === hex}
                    onSelect={() => {
                      setHeaderTextColor(hex);
                      setActiveTheme("");
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Bold + Italic */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Bold</p>
                  <p className="text-xs text-gray-400">Stronger header weight</p>
                </div>
                <Toggle
                  value={boldHeader}
                  onChange={(v) => {
                    setBoldHeader(v);
                    setActiveTheme("");
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Italic</p>
                  <p className="text-xs text-gray-400">Slanted style</p>
                </div>
                <Toggle
                  value={headerItalic}
                  onChange={(v) => {
                    setHeaderItalic(v);
                    setActiveTheme("");
                  }}
                />
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Alignment */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Text alignment</p>
                <p className="text-xs text-gray-400">Position of text inside cells</p>
              </div>
              <AlignmentPicker
                value={headerAlignment}
                onChange={(v) => {
                  setHeaderAlignment(v);
                  setActiveTheme("");
                }}
              />
            </div>

            <div className="border-t border-gray-100" />

            {/* Freeze */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Freeze row 1</p>
                <p className="text-xs text-gray-400">Header stays visible while scrolling</p>
              </div>
              <Toggle
                value={freezeHeader}
                onChange={(v) => {
                  setFreezeHeader(v);
                  setActiveTheme("");
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Alternating Row Colors ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="mr-4">
              <h2 className="font-semibold text-gray-900">Alternating Row Colors</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Zebra-stripe your data so submissions are easy to scan
              </p>
            </div>
            <Toggle
              value={enableBanding}
              onChange={(v) => {
                setEnableBanding(v);
                setActiveTheme("");
              }}
            />
          </div>

          {enableBanding && (
            <div className="mt-5 pt-5 border-t border-gray-100 space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Odd rows <span className="text-gray-400 font-normal">(1st, 3rd…)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROW_PRESETS.map((hex) => (
                    <ColorSwatch
                      key={hex}
                      hex={hex}
                      selected={oddRowColor === hex}
                      onSelect={() => {
                        setOddRowColor(hex);
                        setActiveTheme("");
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Even rows <span className="text-gray-400 font-normal">(2nd, 4th…)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROW_PRESETS.map((hex) => (
                    <ColorSwatch
                      key={hex}
                      hex={hex}
                      selected={evenRowColor === hex}
                      onSelect={() => {
                        setEvenRowColor(hex);
                        setActiveTheme("");
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Advanced ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Advanced</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Auto-resize columns</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Fit each column to its content width — no more cut-off text
              </p>
            </div>
            <Toggle
              value={autoResizeColumns}
              onChange={(v) => {
                setAutoResizeColumns(v);
                setActiveTheme("");
              }}
            />
          </div>
        </section>

        {/* ── Apply Formatting ── */}
        <button
          type="button"
          onClick={handleApplyFormatting}
          disabled={saving}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-sm shadow-sm"
        >
          {saving ? "Applying formatting to your sheet…" : "Apply Formatting to Sheet"}
        </button>
        <p className="text-center text-xs text-gray-400">
          Colours, fonts, and row styles are written directly to your Google Sheet
        </p>
      </div>
    </div>
  );
}
