"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

interface Form {
  formId: string;
  title: string;
  submissionCount: number;
  isActive: boolean;
  createdAt: string;
  sheetName: string;
  responseLimit?: number | null;
  expiryDate?: string | null;
}

// ── Share modal ───────────────────────────────────────────────────────────────
function ShareModal({ form, onClose }: { form: Form; onClose: () => void }) {
  const [copied,      setCopied]      = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedTab,    setEmbedTab]    = useState<"inline" | "dialog" | "iframe">("inline");
  const [buttonText,  setButtonText]  = useState("Open Form");
  const [iframeHeight, setIframeHeight] = useState(600);

  const url = `${APP_URL}/f/${form.formId}`;
  const inlineSnippet = `<script src="${APP_URL}/embed.js" data-form-id="${form.formId}" async></script>`;
  const dialogSnippet = `<script src="${APP_URL}/embed.js" data-form-id="${form.formId}" data-mode="dialog" data-button-text="${buttonText}" async></script>`;
  const iframeSnippet = `<iframe src="${APP_URL}/f/${form.formId}?embed=inline" width="100%" height="${iframeHeight}" frameborder="0" style="border:none;border-radius:16px;" title="${form.title}"></iframe>`;
  const activeSnippet = embedTab === "inline" ? inlineSnippet : embedTab === "dialog" ? dialogSnippet : iframeSnippet;

  const copyUrl = () => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const copyEmbed = () => {
    void navigator.clipboard.writeText(activeSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2200);
  };

  const enc = encodeURIComponent;
  const shareVia = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.16)] w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Share form</p>
            <h3 className="font-bold text-gray-900 text-base truncate max-w-[280px]">{form.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-3 w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* URL copy — primary action */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Form link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 min-w-0">
                <p className="text-sm text-gray-600 truncate font-mono">{url}</p>
              </div>
              <button
                onClick={copyUrl}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  copied
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-violet-600 hover:bg-violet-700 text-white"
                }`}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Quick-share buttons */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Share via</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => shareVia(`https://wa.me/?text=${enc(url)}`)}
                className="flex flex-col items-center gap-1.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
                <span className="text-[11px] font-medium text-gray-600">WhatsApp</span>
              </button>

              <button
                onClick={() => shareVia(`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc("Fill out my form:")}`)}
                className="flex flex-col items-center gap-1.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#111">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-[11px] font-medium text-gray-600">Twitter / X</span>
              </button>

              <button
                onClick={() => shareVia(`mailto:?subject=${enc("Check out my form")}&body=${enc(url)}`)}
                className="flex flex-col items-center gap-1.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="#6b7280" strokeWidth="1.4" />
                  <path d="M2 6l8 5.5L18 6" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className="text-[11px] font-medium text-gray-600">Email</span>
              </button>
            </div>
          </div>

          {/* Open form */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 11L11 2M7 2H11V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Open live form
          </a>

          {/* Embed section */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500">Embed on your website</p>
              {/* Mode tabs */}
              <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
                {(["inline", "dialog", "iframe"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setEmbedTab(t); setCopiedEmbed(false); }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      embedTab === t
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t === "inline" ? "Inline" : t === "dialog" ? "Popup" : "iFrame"}
                  </button>
                ))}
              </div>
            </div>

            {/* Popup button label input */}
            {embedTab === "dialog" && (
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1.5">Button label</label>
                <input
                  value={buttonText}
                  onChange={(e) => { setButtonText(e.target.value); setCopiedEmbed(false); }}
                  placeholder="Open Form"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                />
              </div>
            )}

            {/* iFrame height input */}
            {embedTab === "iframe" && (
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1.5">Height (px)</label>
                <input
                  type="number"
                  value={iframeHeight}
                  min={200}
                  max={2000}
                  onChange={(e) => { setIframeHeight(Number(e.target.value)); setCopiedEmbed(false); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                />
              </div>
            )}

            {/* Description */}
            <p className="text-xs text-gray-400 mb-2.5">
              {embedTab === "inline"
                ? "Renders the form directly in your page where the snippet is placed."
                : embedTab === "dialog"
                ? "A floating button in the corner — opens a modal overlay on click."
                : "Most compatible — works on Shopify, Wix, WordPress, Squarespace, and any platform with a Custom HTML block."}
            </p>

            {/* Platform badges for iFrame */}
            {embedTab === "iframe" && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {["Shopify", "WordPress", "Wix", "Squarespace", "Webflow"].map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold rounded-full"
                  >
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                      <circle cx="3.5" cy="3.5" r="3.5" fill="#10b981" />
                      <path d="M1.5 3.5l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {p}
                  </span>
                ))}
              </div>
            )}

            {/* Snippet + copy */}
            <div className="flex items-start gap-2">
              <code className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[11px] text-gray-600 break-all font-mono leading-relaxed">
                {activeSnippet}
              </code>
              <button
                onClick={copyEmbed}
                className={`shrink-0 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  copiedEmbed
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {copiedEmbed ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              {embedTab === "iframe"
                ? "Paste into any Custom HTML block or widget on your website builder."
                : <>Paste inside the{" "}<code className="bg-gray-100 px-1 py-0.5 rounded text-gray-500">&lt;body&gt;</code>{" "}of any HTML page.</>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharingForm, setSharingForm] = useState<Form | null>(null);

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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8ff]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8ff]">
      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="w-60 min-h-screen bg-white border-r border-gray-200/80 flex flex-col fixed left-0 top-0 bottom-0 z-10">
          <div className="p-5 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-[#111111] rounded-xl flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" />
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-[15px] tracking-tight text-[#111111]">SheetForm</span>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-50 text-violet-700 font-semibold text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.8" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.4" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.4" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.8" />
              </svg>
              My Forms
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Settings
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              {session?.user?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left text-sm text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="ml-60 flex-1 p-8">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#111111]">My Forms</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {forms.length} form{forms.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link
                href="/builder"
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm shadow-violet-200"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                New Form
              </Link>
            </div>

            {forms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="4" y="4" width="9" height="9" rx="2" fill="#7c3aed" fillOpacity="0.15" />
                    <rect x="15" y="4" width="9" height="9" rx="2" fill="#7c3aed" fillOpacity="0.06" />
                    <rect x="4" y="15" width="9" height="9" rx="2" fill="#7c3aed" fillOpacity="0.06" />
                    <rect x="15" y="15" width="9" height="9" rx="2" fill="#7c3aed" fillOpacity="0.15" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No forms yet</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                  Create your first form and connect it to a Google Sheet.
                </p>
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  New Form
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {forms.map((form) => (
                  <div
                    key={form.formId}
                    className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 flex items-center justify-between hover:border-violet-200 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#7c3aed" fillOpacity="0.7" />
                          <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#7c3aed" fillOpacity="0.3" />
                          <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#7c3aed" fillOpacity="0.3" />
                          <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#7c3aed" fillOpacity="0.7" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{form.title}</h3>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                              form.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {form.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-gray-400">
                            {form.submissionCount.toLocaleString()} submission{form.submissionCount !== 1 ? "s" : ""}
                            {form.responseLimit ? ` / ${form.responseLimit.toLocaleString()}` : ""} · {form.sheetName}
                          </p>
                          {form.expiryDate && (
                            <span className="text-[11px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-medium">
                              Expires {new Date(form.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                        {form.responseLimit != null && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, (form.submissionCount / form.responseLimit) * 100)}%`,
                                  backgroundColor: form.submissionCount >= form.responseLimit ? "#dc2626" : "#7c3aed",
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">
                              {Math.round((form.submissionCount / form.responseLimit) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-4">
                      <Link
                        href={`/dashboard/analytics/${form.formId}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M1 9l2.5-2.5 2 2L9 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Analytics
                      </Link>
                      <Link
                        href={`/dashboard/submissions/${form.formId}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Submissions
                        {form.submissionCount > 0 && (
                          <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                            {form.submissionCount > 999 ? "999+" : form.submissionCount}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={() => setSharingForm(form)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="9.5" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                          <circle cx="9.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                          <circle cx="2.5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M3.8 5.2L8.2 3.2M3.8 6.8L8.2 8.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        </svg>
                        Share
                      </button>
                      <Link
                        href={`/f/${form.formId}`}
                        target="_blank"
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/builder?edit=${form.formId}`}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/sheet/${form.formId}`}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Sheet
                      </Link>
                      <Link
                        href={`/settings?form=${form.formId}`}
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
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

      {sharingForm && (
        <ShareModal form={sharingForm} onClose={() => setSharingForm(null)} />
      )}
    </div>
  );
}
