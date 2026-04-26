"use client";

import { useState } from "react";
import { FormData, FormStyle, Field, SheetStyling } from "@/app/builder/page";

interface Props {
  formData: FormData;
  update: (partial: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
  isEditing?: boolean;
}

// ── helpers ──────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function btnPreviewStyle(accent: string, style: FormStyle["buttonStyle"]): React.CSSProperties {
  if (style === "filled") return { backgroundColor: accent, color: "white" };
  if (style === "outline") return { backgroundColor: "transparent", border: `2px solid ${accent}`, color: accent };
  return { backgroundColor: hexToRgba(accent, 0.12), color: accent };
}

// ── sub-components ────────────────────────────────────────────────────────────
const ACCENT_PRESETS = [
  "#7c3aed", "#2563eb", "#059669", "#dc2626",
  "#d97706", "#0891b2", "#db2777", "#111827",
];

const SHEET_THEMES: { name: string; bg: string; text: string }[] = [
  { name: "Violet",  bg: "#7c3aed", text: "#ffffff" },
  { name: "Slate",   bg: "#f8fafc", text: "#1e293b" },
  { name: "Dark",    bg: "#111827", text: "#ffffff" },
  { name: "Green",   bg: "#d1fae5", text: "#065f46" },
  { name: "Blue",    bg: "#dbeafe", text: "#1e40af" },
];

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {ACCENT_PRESETS.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          onClick={() => onChange(c)}
          style={{ backgroundColor: c }}
          className={`w-7 h-7 rounded-lg flex-shrink-0 transition-all ${
            value === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110"
          }`}
        />
      ))}
      <label
        title="Custom color"
        className="w-7 h-7 rounded-lg border-2 border-dashed border-gray-300 hover:border-violet-400 flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden"
        style={!ACCENT_PRESETS.includes(value) ? { backgroundColor: value } : {}}
      >
        <span className={`text-sm font-bold ${!ACCENT_PRESETS.includes(value) ? "text-white" : "text-gray-400"}`}>+</span>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
      </label>
    </div>
  );
}

function ChipGroup<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            value === opt.value
              ? "border-violet-500 bg-violet-50 text-violet-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${checked ? "bg-violet-600" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

// ── Field preview ─────────────────────────────────────────────────────────────
function FieldPreview({ field, accent }: { field: Field; accent: string }) {
  const placeholder =
    field.placeholder ||
    (field.type === "email" ? "name@example.com"
      : field.type === "phone" ? "+1 555 000 0000"
      : field.label ? `Enter ${field.label.toLowerCase()}…` : "");

  if (field.type === "section") {
    return (
      <div className="col-span-2 pt-3 pb-1 border-t border-gray-100 mt-1">
        <p className="text-sm font-bold text-gray-700">{field.label || "Section"}</p>
        {field.placeholder && <p className="text-xs text-gray-400 mt-0.5">{field.placeholder}</p>}
      </div>
    );
  }

  return (
    <div className={field.width === "half" ? "col-span-1" : "col-span-2"}>
      <label className="text-xs font-semibold text-gray-700 block mb-1">
        {field.label || <span className="text-gray-300">Untitled</span>}
        {field.required && <span className="ml-0.5" style={{ color: accent }}>*</span>}
      </label>
      {field.helpText && <p className="text-xs text-gray-400 mb-1 leading-tight">{field.helpText}</p>}
      {field.type === "checkbox" ? (
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0" />
          <span className="text-xs text-gray-400">{field.placeholder || field.label}</span>
        </div>
      ) : field.type === "dropdown" ? (
        <div className="w-full h-9 border border-gray-200 rounded-lg bg-white flex items-center justify-between px-3 pointer-events-none">
          <span className="text-xs text-gray-400">{field.placeholder || "Select an option…"}</span>
          <span className="text-gray-400 text-xs">▾</span>
        </div>
      ) : field.type === "date" ? (
        <div className="w-full h-9 border border-gray-200 rounded-lg bg-white flex items-center px-3 gap-2 pointer-events-none">
          <span className="text-xs">📅</span>
          <span className="text-xs text-gray-400">{field.placeholder || "dd / mm / yyyy"}</span>
        </div>
      ) : (
        <div className="w-full h-9 border border-gray-200 rounded-lg bg-white flex items-center px-3 pointer-events-none">
          <span className="text-xs text-gray-400">{placeholder}</span>
        </div>
      )}
    </div>
  );
}

// ── Sheet preview ─────────────────────────────────────────────────────────────
function SheetPreview({ ss, fields }: { ss: SheetStyling; fields: Field[] }) {
  const cols = [
    ...fields.filter((f) => f.type !== "section" && f.label).slice(0, 3).map((f) => f.label),
    "Timestamp",
  ].slice(0, 4);

  const fallbackCols = cols.length === 1 ? ["Name", "Email", "Message", "Timestamp"] : cols;

  const sampleData = [
    ["Alice Johnson", "alice@example.com", "Hello there!", "2024-01-15 09:32"],
    ["Bob Chen",      "bob@company.org",   "Great product", "2024-01-15 14:07"],
    ["Carol White",   "carol@email.net",   "Follow up pls", "2024-01-16 11:22"],
  ];

  const headerStyle: React.CSSProperties = {
    backgroundColor: ss.headerBgColor,
    color: ss.headerTextColor,
    fontWeight: ss.boldHeader ? "bold" : "normal",
    fontStyle: ss.headerItalic ? "italic" : "normal",
    textAlign: ss.headerAlignment.toLowerCase() as "left" | "center" | "right",
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm text-[11px] font-[system-ui]">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <td className="w-7 bg-gray-100 border-r border-b border-gray-200 text-center text-gray-400 py-2 text-[10px] select-none" />
            {fallbackCols.map((col, i) => (
              <td
                key={i}
                style={headerStyle}
                className={`px-2.5 py-2 border-r border-gray-200/40 truncate max-w-[80px] ${
                  ss.freezeHeader ? "border-b-2 border-b-gray-900/20" : "border-b border-b-gray-200/40"
                }`}
              >
                {col}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {sampleData.map((row, ri) => {
            const rowBg = ss.enableBanding
              ? ri % 2 === 0 ? ss.oddRowColor : ss.evenRowColor
              : "#ffffff";
            return (
              <tr key={ri} style={{ backgroundColor: rowBg }}>
                <td className="bg-gray-100 border-r border-b border-gray-200 text-center text-gray-400 py-1.5 text-[10px] select-none">
                  {ri + 1}
                </td>
                {fallbackCols.map((_, ci) => (
                  <td key={ci} className="px-2.5 py-1.5 border-r border-b border-gray-100 text-gray-500 truncate max-w-[80px]">
                    {row[ci] ?? ""}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {ss.freezeHeader && (
        <div className="text-[10px] text-center text-gray-400 py-1 bg-gray-50 border-t border-gray-100">
          Row 1 frozen
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StepCustomize({
  formData, update, onNext, onBack, saving, isEditing,
}: Props) {
  const [tab, setTab] = useState<"content" | "appearance" | "sheet">("content");

  const fs = formData.formStyle;
  const ss = formData.sheetStyling;
  const accent = fs.accentColor;

  const updateStyle = (partial: Partial<FormStyle>) =>
    update({ formStyle: { ...fs, ...partial } });

  const updateSheet = (partial: Partial<SheetStyling>) =>
    update({ sheetStyling: { ...ss, ...partial } });

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Customize Your Form</h2>
        <p className="text-gray-500 text-sm">Configure content, appearance, and how your Google Sheet looks.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(["content", "appearance", "sheet"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "sheet" ? (
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M1 4h10M4 4v7" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Sheet
              </span>
            ) : t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* ── Left: settings ── */}
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">

          {/* ── Content tab ── */}
          {tab === "content" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Form Title <span className="text-red-400 normal-case font-normal">*</span>
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="e.g. Contact Us"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Description <span className="text-gray-400 normal-case font-normal">optional</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Short description shown above your form"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Submit Button
                </label>
                <input
                  value={formData.buttonLabel}
                  onChange={(e) => update({ buttonLabel: e.target.value })}
                  placeholder="Submit"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">After Submission</p>
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">Thank-you Message</label>
                  <input
                    value={formData.thankYouMessage}
                    onChange={(e) => update({ thankYouMessage: e.target.value })}
                    placeholder="Thank you for your submission!"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">
                    Redirect URL <span className="text-gray-400">(overrides message)</span>
                  </label>
                  <input
                    value={formData.redirectUrl}
                    onChange={(e) => update({ redirectUrl: e.target.value })}
                    placeholder="https://yoursite.com/thank-you"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                  />
                </div>
              </div>

              {/* ── Availability ── */}
              <div className="pt-2 border-t border-gray-100 space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Availability</p>

                {/* Response limit */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Limit responses</p>
                      <p className="text-xs text-gray-400">Auto-close after N submissions</p>
                    </div>
                    <Toggle
                      checked={formData.responseLimit !== null}
                      onChange={() =>
                        update({ responseLimit: formData.responseLimit !== null ? null : 100 })
                      }
                    />
                  </div>
                  {formData.responseLimit !== null && (
                    <div className="flex items-center gap-2.5 bg-violet-50/60 border border-violet-100 rounded-xl px-4 py-2.5">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Close after</span>
                      <input
                        type="number"
                        min="1"
                        value={formData.responseLimit}
                        onChange={(e) =>
                          update({ responseLimit: Math.max(1, parseInt(e.target.value) || 1) })
                        }
                        className="w-20 border border-violet-200 rounded-lg px-2.5 py-1 text-sm font-semibold text-center text-violet-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                      />
                      <span className="text-xs text-gray-500">responses</span>
                    </div>
                  )}
                </div>

                {/* Expiry date */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Set expiry date</p>
                      <p className="text-xs text-gray-400">Auto-close at a specific date &amp; time</p>
                    </div>
                    <Toggle
                      checked={formData.expiryDate !== ""}
                      onChange={() => {
                        if (formData.expiryDate !== "") {
                          update({ expiryDate: "" });
                        } else {
                          const d = new Date();
                          d.setDate(d.getDate() + 30);
                          update({ expiryDate: d.toISOString().slice(0, 16) });
                        }
                      }}
                    />
                  </div>
                  {formData.expiryDate !== "" && (
                    <input
                      type="datetime-local"
                      value={formData.expiryDate}
                      onChange={(e) => update({ expiryDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                    />
                  )}
                </div>

                {/* Closed message — shown only when a limit or expiry is set */}
                {(formData.responseLimit !== null || formData.expiryDate !== "") && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">
                      Closed message
                    </label>
                    <input
                      value={formData.closedMessage}
                      onChange={(e) => update({ closedMessage: e.target.value })}
                      placeholder="This form is no longer accepting responses."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">Shown to visitors when the form is closed.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Appearance tab ── */}
          {tab === "appearance" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Accent Color</label>
                <ColorPicker value={accent} onChange={(c) => updateStyle({ accentColor: c })} />
                <p className="text-xs text-gray-400 mt-2">Applied to the submit button, focus rings, and required markers.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Page Background</label>
                <div className="flex gap-2">
                  {([
                    { value: "gray",   label: "Soft Gray" },
                    { value: "white",  label: "White"     },
                    { value: "tinted", label: "Tinted"    },
                  ] as { value: FormStyle["bgStyle"]; label: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateStyle({ bgStyle: opt.value })}
                      className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all ${
                        fs.bgStyle === opt.value ? "border-violet-500 bg-violet-50" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="w-8 h-5 rounded border border-gray-200"
                        style={{ backgroundColor: opt.value === "gray" ? "#f9fafb" : opt.value === "white" ? "#ffffff" : accent + "22" }}
                      />
                      <span className={`text-xs font-medium ${fs.bgStyle === opt.value ? "text-violet-700" : "text-gray-600"}`}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Button Style</label>
                <div className="flex gap-2">
                  {([
                    { value: "filled",  label: "Filled"  },
                    { value: "outline", label: "Outline" },
                    { value: "soft",    label: "Soft"    },
                  ] as { value: FormStyle["buttonStyle"]; label: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateStyle({ buttonStyle: opt.value })}
                      className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all ${
                        fs.buttonStyle === opt.value ? "border-violet-500 bg-violet-50" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="w-16 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
                        style={btnPreviewStyle(accent, opt.value)}
                      >
                        {opt.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Form Width</label>
                <ChipGroup
                  options={[
                    { value: "narrow",   label: "Narrow"   },
                    { value: "standard", label: "Standard" },
                    { value: "wide",     label: "Wide"     },
                  ]}
                  value={fs.formWidth}
                  onChange={(v) => updateStyle({ formWidth: v })}
                />
                <p className="text-xs text-gray-400 mt-2">Controls the max-width of the form card on desktop.</p>
              </div>
            </>
          )}

          {/* ── Sheet tab ── */}
          {tab === "sheet" && (
            <>
              {/* Header Theme */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Header Theme</label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {SHEET_THEMES.map((theme) => {
                    const active = ss.headerBgColor === theme.bg && ss.headerTextColor === theme.text;
                    return (
                      <button
                        key={theme.name}
                        type="button"
                        onClick={() => updateSheet({ headerBgColor: theme.bg, headerTextColor: theme.text })}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all ${
                          active ? "border-violet-500 bg-violet-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div
                          className="w-8 h-4 rounded"
                          style={{ backgroundColor: theme.bg, border: "1px solid rgba(0,0,0,0.08)" }}
                        />
                        <span className={`text-[10px] font-medium ${active ? "text-violet-700" : "text-gray-500"}`}>{theme.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom colors */}
                <div className="flex gap-3 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-500 w-16">Header bg</span>
                    <div className="relative w-8 h-8 rounded-lg border border-gray-200 overflow-hidden cursor-pointer">
                      <div className="w-full h-full" style={{ backgroundColor: ss.headerBgColor }} />
                      <input
                        type="color"
                        value={ss.headerBgColor}
                        onChange={(e) => updateSheet({ headerBgColor: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-500 w-16">Text color</span>
                    <div className="relative w-8 h-8 rounded-lg border border-gray-200 overflow-hidden cursor-pointer">
                      <div className="w-full h-full" style={{ backgroundColor: ss.headerTextColor }} />
                      <input
                        type="color"
                        value={ss.headerTextColor}
                        onChange={(e) => updateSheet({ headerTextColor: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </label>
                </div>

                {/* Bold / Italic / Alignment */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => updateSheet({ boldHeader: !ss.boldHeader })}
                    className={`w-8 h-8 rounded-lg border text-sm font-black transition-all ${
                      ss.boldHeader ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSheet({ headerItalic: !ss.headerItalic })}
                    className={`w-8 h-8 rounded-lg border text-sm italic font-semibold transition-all ${
                      ss.headerItalic ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    I
                  </button>
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                  <ChipGroup
                    options={[
                      { value: "LEFT",   label: "Left"   },
                      { value: "CENTER", label: "Center" },
                      { value: "RIGHT",  label: "Right"  },
                    ]}
                    value={ss.headerAlignment}
                    onChange={(v) => updateSheet({ headerAlignment: v })}
                  />
                </div>
              </div>

              {/* Layout */}
              <div className="pt-1 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Layout</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Freeze header row</p>
                      <p className="text-xs text-gray-400">Pin row 1 when scrolling</p>
                    </div>
                    <Toggle checked={ss.freezeHeader} onChange={() => updateSheet({ freezeHeader: !ss.freezeHeader })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Auto-resize columns</p>
                      <p className="text-xs text-gray-400">Fit column widths to content</p>
                    </div>
                    <Toggle checked={ss.autoResizeColumns} onChange={() => updateSheet({ autoResizeColumns: !ss.autoResizeColumns })} />
                  </div>
                </div>
              </div>

              {/* Row Colors */}
              <div className="pt-1 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Row Colors</label>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Alternating row colors</p>
                    <p className="text-xs text-gray-400">Zebra striping for readability</p>
                  </div>
                  <Toggle checked={ss.enableBanding} onChange={() => updateSheet({ enableBanding: !ss.enableBanding })} />
                </div>
                {ss.enableBanding && (
                  <div className="flex gap-4 bg-gray-50 rounded-xl p-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative w-8 h-8 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="w-full h-full" style={{ backgroundColor: ss.oddRowColor }} />
                        <input type="color" value={ss.oddRowColor} onChange={(e) => updateSheet({ oddRowColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      </div>
                      <span className="text-xs text-gray-500">Odd rows</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative w-8 h-8 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="w-full h-full" style={{ backgroundColor: ss.evenRowColor }} />
                        <input type="color" value={ss.evenRowColor} onChange={(e) => updateSheet({ evenRowColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      </div>
                      <span className="text-xs text-gray-500">Even rows</span>
                    </label>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2.5 leading-relaxed">
                Formatting is applied to your Google Sheet when you publish or save changes.
              </p>
            </>
          )}
        </div>

        {/* ── Right: preview ── */}
        <div className="bg-[#f3f3f8] rounded-2xl p-4 flex flex-col min-h-[340px]">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {tab === "sheet" ? "Sheet Preview" : "Live Preview"}
          </p>

          {tab === "sheet" ? (
            <div className="flex-1 flex flex-col">
              <SheetPreview ss={ss} fields={formData.fields} />
              <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                Sample data — your sheet will look like this after publishing.
              </p>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                <span className="text-xs text-gray-400">{accent}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1 leading-tight">
                {formData.title || <span className="text-gray-300">Form Title</span>}
              </h3>
              {formData.description && (
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{formData.description}</p>
              )}
              {formData.fields.length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-6">No fields added yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-3 mt-2">
                  {formData.fields.map((f, i) => <FieldPreview key={i} field={f} accent={accent} />)}
                </div>
              )}
              <div
                className="mt-4 w-full h-10 rounded-lg flex items-center justify-center text-sm font-semibold"
                style={btnPreviewStyle(accent, fs.buttonStyle)}
              >
                {formData.buttonLabel || "Submit"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-900 text-sm font-medium px-4 py-2.5 flex items-center gap-1.5 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!formData.title || saving}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
        >
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving
            ? isEditing ? "Saving…" : "Publishing…"
            : isEditing ? "Save Changes" : "Publish Form"}
          {!saving && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
