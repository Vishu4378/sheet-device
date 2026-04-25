"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  formId: string;
  isEditing?: boolean;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function StepPublish({ formId, isEditing }: Props) {
  const hostedUrl  = `${APP_URL}/f/${formId}`;
  const embedCode  = `<script src="${APP_URL}/embed.js" data-form-id="${formId}" async></script>`;

  const [copiedUrl,   setCopiedUrl]   = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

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
            <path
              d="M3 13L9.5 19.5L23 6"
              stroke="#7c3aed"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path
              d="M13 2L16 10H24L18 15.5L20.5 23.5L13 18.5L5.5 23.5L8 15.5L2 10H10L13 2Z"
              fill="#7c3aed"
            />
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
        {/* Hosted URL */}
        <div className="border border-gray-200 rounded-2xl p-4 hover:border-violet-200 transition-colors group">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Hosted URL
            </p>
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

        {/* Embed code */}
        <div className="border border-gray-200 rounded-2xl p-4 hover:border-violet-200 transition-colors">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Embed Code
          </p>
          <div className="flex items-start gap-2 mb-2">
            <code className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-700 break-all font-mono leading-relaxed">
              {embedCode}
            </code>
            <button
              onClick={() => copy(embedCode, "embed")}
              className={`shrink-0 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                copiedEmbed
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {copiedEmbed ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Paste this inside the{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">&lt;body&gt;</code>{" "}
            of any HTML page to embed your form.
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
