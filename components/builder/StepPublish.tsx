"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  formId: string;
  isEditing?: boolean;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ── Visual mockups ────────────────────────────────────────────────────────────
function InlineMockup() {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden text-[8px] select-none">
      {/* Fake browser bar */}
      <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-200 px-2 py-1.5">
        <div className="w-2 h-2 rounded-full bg-gray-200" />
        <div className="w-2 h-2 rounded-full bg-gray-200" />
        <div className="w-2 h-2 rounded-full bg-gray-200" />
        <div className="ml-2 flex-1 bg-gray-100 rounded h-1.5" />
      </div>
      {/* Fake page with embedded form */}
      <div className="p-3 space-y-1.5">
        <div className="h-1.5 bg-gray-100 rounded w-3/4" />
        <div className="h-1 bg-gray-100 rounded w-1/2" />
        <div className="mt-2 border border-violet-200 bg-violet-50/40 rounded-lg p-2 space-y-1.5">
          <div className="h-1.5 bg-violet-200 rounded w-1/3" />
          <div className="h-3 border border-gray-200 rounded bg-white" />
          <div className="h-3 border border-gray-200 rounded bg-white" />
          <div className="h-3 bg-violet-500 rounded w-1/3" />
        </div>
        <div className="h-1 bg-gray-100 rounded w-2/3 mt-1" />
      </div>
    </div>
  );
}

function PopupMockup({ buttonColor }: { buttonColor: string }) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden text-[8px] select-none relative">
      {/* Fake browser bar */}
      <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-200 px-2 py-1.5">
        <div className="w-2 h-2 rounded-full bg-gray-200" />
        <div className="w-2 h-2 rounded-full bg-gray-200" />
        <div className="w-2 h-2 rounded-full bg-gray-200" />
        <div className="ml-2 flex-1 bg-gray-100 rounded h-1.5" />
      </div>
      {/* Fake page */}
      <div className="p-3 space-y-1.5 min-h-[56px]">
        <div className="h-1.5 bg-gray-100 rounded w-3/4" />
        <div className="h-1 bg-gray-100 rounded w-1/2" />
        <div className="h-1 bg-gray-100 rounded w-2/3" />
      </div>
      {/* Floating button */}
      <div
        className="absolute bottom-2 right-2 rounded-full px-2.5 py-1 text-white font-bold flex items-center gap-1"
        style={{ backgroundColor: buttonColor, fontSize: "7px" }}
      >
        <svg width="7" height="7" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="10" rx="2" stroke="white" strokeWidth="1.8" />
          <path d="M4 7.5h4M4 10.5h7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Open Form
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StepPublish({ formId, isEditing }: Props) {
  const hostedUrl = `${APP_URL}/f/${formId}`;

  const [copiedUrl,   setCopiedUrl]   = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedTab,    setEmbedTab]    = useState<"inline" | "dialog">("inline");
  const [buttonText,  setButtonText]  = useState("Open Form");
  const [buttonColor, setButtonColor] = useState("#7c3aed");

  const inlineSnippet = `<script src="${APP_URL}/embed.js" data-form-id="${formId}" async></script>`;
  const dialogSnippet = `<script src="${APP_URL}/embed.js" data-form-id="${formId}" data-mode="dialog" data-button-text="${buttonText}" data-button-color="${buttonColor}" async></script>`;
  const activeSnippet = embedTab === "inline" ? inlineSnippet : dialogSnippet;

  const copy = (text: string, which: "url" | "embed") => {
    void navigator.clipboard.writeText(text);
    if (which === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  return (
    <div className="text-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-violet-50 border-2 border-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        {isEditing ? (
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M3 13L9.5 19.5L23 6" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M13 2L16 10H24L18 15.5L20.5 23.5L13 18.5L5.5 23.5L8 15.5L2 10H10L13 2Z" fill="#7c3aed" />
          </svg>
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {isEditing ? "Changes saved!" : "Your form is live!"}
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        {isEditing
          ? "Your updates are live. Share the URL or grab the embed snippet."
          : "Share it as a standalone page, or embed it anywhere with one line of code."}
      </p>

      <div className="text-left space-y-3 mb-8">
        {/* ── Hosted URL ── */}
        <div className="border border-gray-200 rounded-2xl p-4 hover:border-violet-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hosted URL</p>
            <Link
              href={hostedUrl}
              target="_blank"
              className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 transition-colors"
            >
              Open
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 9L9 2M5.5 2H9V5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 break-all">
              {hostedUrl}
            </code>
            <button
              onClick={() => copy(hostedUrl, "url")}
              className={`shrink-0 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                copiedUrl
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-violet-600 hover:bg-violet-700 text-white"
              }`}
            >
              {copiedUrl ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* ── Embed section ── */}
        <div className="border border-gray-200 rounded-2xl p-4 hover:border-violet-200 transition-colors">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Embed</p>

          {/* Mode tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
            {(["inline", "dialog"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setEmbedTab(t); setCopiedEmbed(false); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  embedTab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "inline" ? "Inline" : "Popup"}
              </button>
            ))}
          </div>

          {/* Mode content */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            {/* Mockup */}
            <div>
              {embedTab === "inline" ? (
                <InlineMockup />
              ) : (
                <PopupMockup buttonColor={buttonColor} />
              )}
            </div>

            {/* Description + options */}
            <div className="flex flex-col justify-between">
              {embedTab === "inline" ? (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Inline widget</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    The form renders directly in your page where you paste the snippet — great for dedicated landing pages and contact sections.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Popup / Dialog</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      A floating button appears in the corner. Visitors click it to open your form in a smooth modal overlay.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Button label</label>
                    <input
                      value={buttonText}
                      onChange={(e) => { setButtonText(e.target.value); setCopiedEmbed(false); }}
                      placeholder="Open Form"
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Button color</label>
                    <div className="flex items-center gap-2">
                      <label className="relative w-8 h-8 rounded-lg border border-gray-200 overflow-hidden cursor-pointer flex-shrink-0">
                        <div className="w-full h-full" style={{ backgroundColor: buttonColor }} />
                        <input
                          type="color"
                          value={buttonColor}
                          onChange={(e) => { setButtonColor(e.target.value); setCopiedEmbed(false); }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </label>
                      <span className="text-xs text-gray-400 font-mono">{buttonColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Snippet + copy */}
          <div className="flex items-start gap-2">
            <code className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-700 break-all font-mono leading-relaxed">
              {activeSnippet}
            </code>
            <button
              onClick={() => copy(activeSnippet, "embed")}
              className={`shrink-0 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                copiedEmbed
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {copiedEmbed ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Paste inside the{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">&lt;body&gt;</code>{" "}
            of any HTML page.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Link
          href={hostedUrl}
          target="_blank"
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 12L12 2M8 2H12V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          View Live Form
        </Link>
        <Link
          href="/dashboard"
          className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
