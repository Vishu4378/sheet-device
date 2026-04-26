import { connectDB } from "@/lib/mongodb";
import { Form } from "@/models/Form";
import { notFound } from "next/navigation";
import PublicFormClient from "./PublicFormClient";

function FormClosedCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8ff] px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-[0_4px_32px_rgba(0,0,0,0.06)] p-10 text-center">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect x="5" y="12" width="16" height="11" rx="2.5" stroke="#d97706" strokeWidth="1.6" />
            <path d="M9 12V8a4 4 0 0 1 8 0v4" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="13" cy="17.5" r="1.5" fill="#d97706" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{message}</p>
        <div className="mt-8 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Powered by{" "}
            <a href="/" className="font-semibold text-gray-500 hover:text-violet-600 transition-colors">
              SheetForm
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

type LeanForm = {
  title: string;
  submissionCount: number;
  responseLimit?: number | null;
  expiryDate?: Date | null;
  closedMessage?: string;
} & Record<string, unknown>;

export default async function PublicFormPage({
  params,
  searchParams,
}: {
  params: { formId: string };
  searchParams: { embed?: string | string[] };
}) {
  await connectDB();
  const raw = await Form.findOne({ formId: params.formId, isActive: true }).lean();
  if (!raw) notFound();

  const form = raw as LeanForm;
  const isClosedByLimit = form.responseLimit != null && form.submissionCount >= form.responseLimit;
  const isClosedByExpiry = form.expiryDate != null && new Date() > new Date(form.expiryDate);

  if (isClosedByLimit || isClosedByExpiry) {
    return (
      <FormClosedCard
        title={form.title}
        message={form.closedMessage || "This form is no longer accepting responses."}
      />
    );
  }

  const embed = typeof searchParams.embed === "string" ? searchParams.embed : undefined;
  return <PublicFormClient form={JSON.parse(JSON.stringify(raw))} embed={embed} />;
}
