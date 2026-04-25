"use client";

import { useState } from "react";
import { FormData, FormStyle, Field } from "@/app/builder/page";

interface Props {
  formData: FormData;
  update: (partial: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
  isEditing?: boolean;
}

// ── helpers ──────────────────────────────────────────────────────
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

function btnPreviewStyle(
  accent: string,
  style: FormStyle["buttonStyle"]
): React.CSSProperties {
  if (style === "filled") return { backgroundColor: accent, color: "white" };
  if (style === "outline")
    return { backgroundColor: "transparent", border: `2px solid ${accent}`, color: accent };
  return { backgroundColor: hexToRgba(accent, 0.12), color: accent };
}

// ── sub-components ────────────────────────────────────────────────
const ACCENT_PRESETS = [
  "#7c3aed", "#2563eb", "#059669", "#dc2626",
  "#d97706", "#0891b2", "#db2777", "#111827",
];

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
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
            value === c
              ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
              : "hover:scale-110"
          }`}
        />
      ))}
      {/* Custom color input */}
      <label
        title="Custom color"
        className="w-7 h-7 rounded-lg border-2 border-dashed border-gray-300 hover:border-violet-400 flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden"
        style={!ACCENT_PRESETS.includes(value) ? { backgroundColor: value } : {}}
      >
        <span className={`text-sm font-bold ${!ACCENT_PRESETS.includes(value) ? "text-white" : "text-gray-400"}`}>
          +
        </span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
    </div>
  );
}

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
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

// ── Field preview ─────────────────────────────────────────────────
function FieldPreview({ field, accent }: { field: Field; accent: string }) {
  const placeholder =
    field.placeholder ||
    (field.type === "email"
      ? "name@example.com"
      : field.type === "phone"
      ? "+1 555 000 0000"
      : field.label
      ? `Enter ${field.label.toLowerCase()}…`
      : "");

  if (field.type === "section") {
    return (
      <div className="col-span-2 pt-3 pb-1 border-t border-gray-100 mt-1">
        <p className="text-sm font-bold text-gray-700">{field.label || "Section"}</p>
        {field.placeholder && (
          <p className="text-xs text-gray-400 mt-0.5">{field.placeholder}</p>
        )}
      </div>
    );
  }

  const isHalf = field.width === "half";

  return (
    <div className={isHalf ? "col-span-1" : "col-span-2"}>
      <label className="text-xs font-semibold text-gray-700 block mb-1">
        {field.label || <span className="text-gray-300">Untitled</span>}
        {field.required && <span className="ml-0.5" style={{ color: accent }}>*</span>}
      </label>
      {field.helpText && (
        <p className="text-xs text-gray-400 mb-1 leading-tight">{field.helpText}</p>
      )}
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

// ── Main component ────────────────────────────────────────────────
export default function StepCustomize({
  formData,
  update,
  onNext,
  onBack,
  saving,
  isEditing,
}: Props) {
  const [tab, setTab] = useState<"content" | "appearance">("content");

  const fs = formData.formStyle;
  const updateStyle = (partial: Partial<FormStyle>) =>
    update({ formStyle: { ...fs, ...partial } });

  const accent = fs.accentColor;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Customize Your Form</h2>
        <p className="text-gray-500 text-sm">
          Configure content, appearance, and post-submission behaviour.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(["content", "appearance"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* ── Left: settings (scrollable) ── */}
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
          {tab === "content" ? (
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
                  Description{" "}
                  <span className="text-gray-400 normal-case font-normal">optional</span>
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
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  After Submission
                </p>
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
                    Redirect URL{" "}
                    <span className="text-gray-400">(overrides message)</span>
                  </label>
                  <input
                    value={formData.redirectUrl}
                    onChange={(e) => update({ redirectUrl: e.target.value })}
                    placeholder="https://yoursite.com/thank-you"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Accent Color */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Accent Color
                </label>
                <ColorPicker value={accent} onChange={(c) => updateStyle({ accentColor: c })} />
                <p className="text-xs text-gray-400 mt-2">
                  Applied to the submit button, focus rings, and required markers.
                </p>
              </div>

              {/* Background */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Page Background
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { value: "gray",   label: "Soft Gray" },
                      { value: "white",  label: "White"     },
                      { value: "tinted", label: "Tinted"    },
                    ] as { value: FormStyle["bgStyle"]; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateStyle({ bgStyle: opt.value })}
                      className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all ${
                        fs.bgStyle === opt.value
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="w-8 h-5 rounded border border-gray-200"
                        style={{
                          backgroundColor:
                            opt.value === "gray"
                              ? "#f9fafb"
                              : opt.value === "white"
                              ? "#ffffff"
                              : accent + "22",
                        }}
                      />
                      <span className={`text-xs font-medium ${fs.bgStyle === opt.value ? "text-violet-700" : "text-gray-600"}`}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Style */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Button Style
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { value: "filled",  label: "Filled"  },
                      { value: "outline", label: "Outline" },
                      { value: "soft",    label: "Soft"    },
                    ] as { value: FormStyle["buttonStyle"]; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateStyle({ buttonStyle: opt.value })}
                      className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all ${
                        fs.buttonStyle === opt.value
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
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

              {/* Form Width */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Form Width
                </label>
                <ChipGroup
                  options={[
                    { value: "narrow",   label: "Narrow"   },
                    { value: "standard", label: "Standard" },
                    { value: "wide",     label: "Wide"     },
                  ]}
                  value={fs.formWidth}
                  onChange={(v) => updateStyle({ formWidth: v })}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Controls the max-width of the form card on desktop.
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Right: live preview ── */}
        <div className="bg-[#f3f3f8] rounded-2xl p-4 flex flex-col min-h-[340px]">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Live Preview
          </p>
          <div className="flex-1 bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm overflow-y-auto">
            {/* Accent colour dot indicator */}
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
                {formData.fields.map((f, i) => (
                  <FieldPreview key={i} field={f} accent={accent} />
                ))}
              </div>
            )}

            {/* Submit button preview */}
            <div
              className="mt-4 w-full h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all"
              style={btnPreviewStyle(accent, fs.buttonStyle)}
            >
              {formData.buttonLabel || "Submit"}
            </div>
          </div>
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
          {saving && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
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
