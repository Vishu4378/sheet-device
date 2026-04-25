"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import StepConnectSheet from "@/components/builder/StepConnectSheet";
import StepAddFields from "@/components/builder/StepAddFields";
import StepCustomize from "@/components/builder/StepCustomize";
import StepPublish from "@/components/builder/StepPublish";
import Link from "next/link";

const STEPS = ["Connect Sheet", "Add Fields", "Customize"];

export interface FormStyle {
  accentColor: string;
  bgStyle: "gray" | "white" | "tinted";
  buttonStyle: "filled" | "outline" | "soft";
  formWidth: "narrow" | "standard" | "wide";
}

export interface FormData {
  sheetId: string;
  sheetName: string;
  sheetTitle: string;
  headers: string[];
  fields: Field[];
  title: string;
  description: string;
  buttonLabel: string;
  thankYouMessage: string;
  redirectUrl: string;
  formStyle: FormStyle;
}

export interface Field {
  label: string;
  type: "text" | "email" | "phone" | "dropdown" | "checkbox" | "date" | "section";
  required: boolean;
  options: string[];
  sheetColumn: string;
  placeholder: string;
  helpText: string;
  width: "full" | "half";
}

const DEFAULT_FORM_STYLE: FormStyle = {
  accentColor: "#7c3aed",
  bgStyle: "gray",
  buttonStyle: "filled",
  formWidth: "standard",
};

const defaultFormData: FormData = {
  sheetId: "",
  sheetName: "",
  sheetTitle: "",
  headers: [],
  fields: [],
  title: "My Form",
  description: "",
  buttonLabel: "Submit",
  thankYouMessage: "Thank you for your submission!",
  redirectUrl: "",
  formStyle: { ...DEFAULT_FORM_STYLE },
};

function BuilderPageInner() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editFormId = searchParams.get("edit");

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [savedFormId, setSavedFormId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingForm, setLoadingForm] = useState(!!editFormId);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!editFormId || status !== "authenticated") return;
    fetch(`/api/forms/${editFormId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.form) throw new Error("Form not found");
        const f = d.form;
        setFormData({
          sheetId: f.sheetId,
          sheetName: f.sheetName,
          sheetTitle: f.sheetName,
          headers: f.sheetHeaders || [],
          fields: (f.fields || []).map((field: Partial<Field>) => ({
            label: field.label ?? "",
            type: field.type ?? "text",
            required: field.required ?? false,
            options: field.options ?? [],
            sheetColumn: field.sheetColumn ?? "",
            placeholder: field.placeholder ?? "",
            helpText: field.helpText ?? "",
            width: field.width ?? "full",
          })),
          title: f.title,
          description: f.description || "",
          buttonLabel: f.buttonLabel || "Submit",
          thankYouMessage: f.thankYouMessage || "Thank you for your submission!",
          redirectUrl: f.redirectUrl || "",
          formStyle: {
            accentColor: f.formStyle?.accentColor ?? DEFAULT_FORM_STYLE.accentColor,
            bgStyle: f.formStyle?.bgStyle ?? DEFAULT_FORM_STYLE.bgStyle,
            buttonStyle: f.formStyle?.buttonStyle ?? DEFAULT_FORM_STYLE.buttonStyle,
            formWidth: f.formStyle?.formWidth ?? DEFAULT_FORM_STYLE.formWidth,
          },
        });
        setSavedFormId(editFormId);
      })
      .catch(() => setError("Failed to load form for editing."))
      .finally(() => setLoadingForm(false));
  }, [editFormId, status]);

  const update = (partial: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const handlePublish = async () => {
    setSaving(true);
    setError("");
    try {
      if (editFormId) {
        const res = await fetch(`/api/forms/${editFormId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to update form");
      } else {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = (await res.json()) as { error?: string; form?: { formId: string } };
        if (!res.ok) throw new Error(data.error || "Failed to create form");
        setSavedFormId(data.form?.formId ?? "");
      }
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loadingForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8ff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8ff]">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200/80 px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="4" height="4" rx="1" fill="white" />
                <rect x="8" y="2" width="4" height="4" rx="1" fill="white" opacity="0.7" />
                <rect x="2" y="8" width="4" height="4" rx="1" fill="white" opacity="0.7" />
                <rect x="8" y="8" width="4" height="4" rx="1" fill="white" opacity="0.5" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              {editFormId ? "Edit Form" : "Form Builder"}
            </span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Step rail */}
        {step < 3 && (
          <div className="flex items-start justify-center mb-12">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      i < step
                        ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                        : i === step
                        ? "bg-violet-600 text-white ring-4 ring-violet-100 shadow-sm shadow-violet-200"
                        : "bg-white text-gray-400 border-2 border-gray-200"
                    }`}
                  >
                    {i < step ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10.5L11.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium hidden sm:block transition-colors ${
                      i === step ? "text-violet-700" : i < step ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                      i < step ? "bg-violet-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Global error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7.5 4.5V8M7.5 10.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        {/* Step card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
          {step === 0 && (
            <StepConnectSheet formData={formData} update={update} onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <StepAddFields
              formData={formData}
              update={update}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepCustomize
              formData={formData}
              update={update}
              onNext={handlePublish}
              onBack={() => setStep(1)}
              saving={saving}
              isEditing={!!editFormId}
            />
          )}
          {step === 3 && <StepPublish formId={savedFormId} isEditing={!!editFormId} />}
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f8ff]">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BuilderPageInner />
    </Suspense>
  );
}
