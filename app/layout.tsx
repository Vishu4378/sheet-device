import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://sheetform.app"),
  title: {
    template: "%s | SheetForm",
    default: "SheetForm – Forms that write to Google Sheets automatically",
  },
  description:
    "Build beautiful forms in minutes, connect any Google Sheet, and watch every submission appear as a live row — no backend, no code, no waiting.",
  keywords: [
    "google sheets form builder",
    "form to google sheets",
    "no-code form",
    "embed form google sheets",
    "spreadsheet form",
    "google sheets integration",
  ],
  authors: [{ name: "SheetForm" }],
  creator: "SheetForm",
  publisher: "SheetForm",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SheetForm",
    title: "SheetForm – Forms that write to Google Sheets automatically",
    description:
      "Build beautiful forms, connect any Google Sheet, collect submissions live — no backend required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SheetForm – Connect forms to Google Sheets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SheetForm – Forms that write to Google Sheets",
    description:
      "Build a form in minutes, connect any Google Sheet, watch submissions appear live. Start free.",
    images: ["/og-image.png"],
    creator: "@sheetform",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
