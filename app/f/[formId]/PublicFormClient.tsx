"use client";

import { useState } from "react";

interface Field {
  label: string;
  type: string;
  required: boolean;
  options: string[];
  placeholder: string;
  helpText?: string;
  width?: "full" | "half";
}

interface FormStyle {
  accentColor?: string;
  bgStyle?: "gray" | "white" | "tinted";
  buttonStyle?: "filled" | "outline" | "soft";
  formWidth?: "narrow" | "standard" | "wide";
}

interface FormDef {
  formId: string;
  title: string;
  description?: string;
  fields: Field[];
  buttonLabel: string;
  thankYouMessage: string;
  redirectUrl?: string;
  formStyle?: FormStyle;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function PublicFormClient({ form }: { form: FormDef }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Style resolution with safe defaults
  const accent      = form.formStyle?.accentColor  ?? "#7c3aed";
  const bgStyle     = form.formStyle?.bgStyle      ?? "gray";
  const buttonStyle = form.formStyle?.buttonStyle  ?? "filled";
  const formWidth   = form.formStyle?.formWidth    ?? "standard";

  const widthClass = { narrow: "max-w-sm", standard: "max-w-lg", wide: "max-w-2xl" }[formWidth];

  const pageBgStyle: React.CSSProperties =
    bgStyle === "white"  ? { backgroundColor: "#ffffff" } :
    bgStyle === "tinted" ? { backgroundColor: hexToRgba(accent, 0.07) } :
    {};
  const pageBgClass = bgStyle === "gray" ? "bg-gray-50" : "";

  const btnStyle: React.CSSProperties =
    buttonStyle === "filled"
      ? { backgroundColor: accent, color: "white" }
      : buttonStyle === "outline"
      ? { backgroundColor: "transparent", border: `2px solid ${accent}`, color: accent }
      : { backgroundColor: hexToRgba(accent, 0.1), color: accent };

  // CSS custom properties for dynamic focus ring (consumed by .form-input in globals.css)
  const accentVars = {
    "--form-accent":      accent,
    "--form-accent-ring": hexToRgba(accent, 0.18),
  } as React.CSSProperties;

  const set = (label: string, val: string) =>
    setValues((prev) => ({ ...prev, [label]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const payload = { ...values, company: "" };

    try {
      const res = await fetch(`/api/submit/${form.formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; redirectUrl?: string };
      if (!res.ok) throw new Error(data.error || "Submission failed");

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setStatus("success");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${pageBgClass}`}
        style={{ ...pageBgStyle, ...accentVars }}
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: hexToRgba(accent, 0.1) }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M4 14L10.5 20.5L24 7"
                stroke={accent}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{form.thankYouMessage}</h2>
          <p className="text-gray-400 text-sm mt-4">
            Powered by{" "}
            <a href="/" className="hover:underline" style={{ color: accent }}>
              SheetForm
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-12 ${pageBgClass}`}
      style={{ ...pageBgStyle, ...accentVars }}
    >
      <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full ${widthClass}`}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{form.title}</h1>
        {form.description && (
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{form.description}</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Honeypot — hidden from real users */}
          <input
            type="text"
            name="company"
            value=""
            onChange={() => {}}
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* 2-column grid; sections + full-width fields span both cols */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 mb-5">
            {form.fields.map((field, i) => {
              if (field.type === "section") {
                return (
                  <div
                    key={i}
                    className="col-span-2 pt-4 border-t border-gray-100 mt-1 first:pt-0 first:border-0 first:mt-0"
                  >
                    <p className="text-base font-bold text-gray-800">{field.label}</p>
                    {field.placeholder && (
                      <p className="text-sm text-gray-400 mt-0.5 leading-snug">{field.placeholder}</p>
                    )}
                  </div>
                );
              }

              const colSpan = field.width === "half" ? "col-span-1" : "col-span-2";

              return (
                <div key={i} className={colSpan}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {field.label}
                    {field.required && (
                      <span className="ml-0.5 font-bold" style={{ color: accent }}>*</span>
                    )}
                  </label>

                  {field.helpText && (
                    <p className="text-xs text-gray-400 mb-1.5 leading-snug">{field.helpText}</p>
                  )}

                  {field.type === "dropdown" ? (
                    <select
                      required={field.required}
                      value={values[field.label] || ""}
                      onChange={(e) => set(field.label, e.target.value)}
                      className="form-input w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                    >
                      <option value="">Select an option</option>
                      {field.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        required={field.required}
                        checked={values[field.label] === "true"}
                        onChange={(e) =>
                          set(field.label, e.target.checked ? "true" : "false")
                        }
                        style={{ accentColor: accent }}
                        className="w-4 h-4 rounded border-gray-300 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-600">
                        {field.placeholder || field.label}
                      </span>
                    </label>
                  ) : (
                    <input
                      type={field.type === "phone" ? "tel" : field.type}
                      required={field.required}
                      value={values[field.label] || ""}
                      onChange={(e) => set(field.label, e.target.value)}
                      placeholder={field.placeholder}
                      className="form-input w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7 4V7.5M7 9.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={btnStyle}
          >
            {status === "submitting" && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {status === "submitting" ? "Submitting…" : form.buttonLabel}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Powered by{" "}
          <a href="/" className="hover:underline" style={{ color: accent }}>
            SheetForm
          </a>
        </p>
      </div>
    </div>
  );
}
