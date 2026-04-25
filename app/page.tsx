import Link from "next/link";

/* ─── shared primitives ─────────────────────────────────────── */

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5">
      <circle cx="9" cy="9" r="9" fill="#f5f3ff" />
      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return <span className="tag">{children}</span>;
}

function MockupBar() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50">
      <div className="w-3 h-3 rounded-full bg-red-400/80" />
      <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
      <div className="w-3 h-3 rounded-full bg-green-400/80" />
      <div className="flex-1 mx-3 bg-white border border-gray-200 rounded-md px-3 py-1 text-[11px] text-gray-400 font-mono">
        sheetform.app
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="bg-white text-[#111111] overflow-x-hidden">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "SheetForm",
          "url": "https://sheetform.app",
          "description": "Form builder that submits directly to Google Sheets",
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "SheetForm",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "1200" },
        }) }}
      />

      {/* ════════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#111111] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#7c3aed] transition-colors duration-200">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="white" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight text-[#111111]">SheetForm</span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Product",    href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing",    href: "#pricing" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[14px] text-gray-500 hover:text-[#111111] font-medium transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[14px] text-gray-500 hover:text-[#111111] font-medium transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/login" className="btn-dark text-sm px-5 py-2.5">
              Get started <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
      </header>


      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="aurora-bg pt-28 pb-24 px-6 min-h-screen flex items-center">

        {/* ── Aurora orbs ──────────────────────────────────────
            Soft colour pools that drift slowly, exactly like
            the macOS Sonoma / Sequoia mesh-gradient wallpaper.
            The Liquid Glass floating cards pick up these colours
            through backdrop-filter, making them feel alive.     */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
          {/* Violet — top-left */}
          <div className="aurora-orb-1 absolute rounded-full"
            style={{ width: 680, height: 680, top: "-18%", left: "-12%",
              background: "radial-gradient(circle, rgba(167,139,250,0.38) 0%, rgba(139,92,246,0.16) 45%, transparent 70%)",
              filter: "blur(72px)" }} />
          {/* Indigo/Blue — top-right */}
          <div className="aurora-orb-2 absolute rounded-full"
            style={{ width: 560, height: 560, top: "-8%", right: "-8%",
              background: "radial-gradient(circle, rgba(147,197,253,0.32) 0%, rgba(99,102,241,0.14) 50%, transparent 70%)",
              filter: "blur(80px)" }} />
          {/* Sky — centre-right */}
          <div className="aurora-orb-3 absolute rounded-full"
            style={{ width: 440, height: 440, top: "35%", right: "5%",
              background: "radial-gradient(circle, rgba(186,230,253,0.30) 0%, rgba(56,189,248,0.12) 50%, transparent 70%)",
              filter: "blur(60px)" }} />
          {/* Rose — bottom-left */}
          <div className="aurora-orb-4 absolute rounded-full"
            style={{ width: 360, height: 360, bottom: "5%", left: "15%",
              background: "radial-gradient(circle, rgba(253,164,175,0.20) 0%, rgba(244,114,182,0.08) 55%, transparent 70%)",
              filter: "blur(64px)" }} />
          {/* Subtle dot grid — masks to the aurora region */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(109,40,217,0.06) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              maskImage: "radial-gradient(ellipse 75% 65% at 62% 38%, black 0%, transparent 68%)",
              WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 62% 38%, black 0%, transparent 68%)",
            }} />
        </div>

        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">

            {/* ── LEFT: Copy ─────────────────────────────────── */}
            <div className="max-w-xl">

              {/* Badge */}
              <div className="animate-fade-up inline-flex items-center gap-2.5 mb-8">
                <span className="flex items-center gap-1.5 bg-[#111111] text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  New — Email notifications now live
                </span>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-up delay-1 font-extrabold tracking-[-0.035em] text-[#111111] leading-[1.04] mb-7"
                  style={{ fontSize: "clamp(44px, 5.5vw, 80px)" }}>
                Forms that write
                <br />
                <span style={{
                  background: "linear-gradient(118deg, #5b21b6 0%, #7c3aed 35%, #4f46e5 65%, #0ea5e9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  to Google Sheets
                </span>
                <br />
                automatically.
              </h1>

              {/* Subtext */}
              <p className="animate-fade-up delay-2 text-[18px] text-gray-500 leading-[1.7] mb-10 max-w-md">
                Build a form in minutes, connect any Google Sheet, and watch every submission appear as a live row — no backend, no code, no&nbsp;waiting.
              </p>

              {/* CTAs */}
              <div className="animate-fade-up delay-3 flex flex-wrap gap-3 mb-10">
                <Link href="/login" className="btn-dark px-8 py-4 text-[15px] shadow-lg shadow-black/15">
                  Create a form — it&apos;s free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <a href="#how-it-works" className="btn-outline px-7 py-4 text-[15px]">
                  See how it works
                </a>
              </div>

              {/* Trust micro-row */}
              <div className="animate-fade-up delay-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["#7c3aed","#0284c7","#059669","#d97706"].map((c, i) => (
                      <div key={i} style={{ background: c, border: "2px solid white", zIndex: 4 - i }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[13px] text-gray-500 font-medium">1,200+ teams</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 13 13" fill="#f59e0b">
                      <path d="M6.5 1l1.4 3 3.3.5-2.4 2.3.6 3.2-2.9-1.5L3.6 10l.6-3.2L1.8 4.5l3.3-.5z"/>
                    </svg>
                  ))}
                  <span className="text-[13px] text-gray-500 font-medium ml-1">4.9 / 5</span>
                </div>
                <span className="text-[13px] text-gray-400">No credit card needed</span>
              </div>
            </div>

            {/* ── RIGHT: Mockup ───────────────────────────────── */}
            <div className="relative hidden lg:flex items-center justify-center" style={{ minHeight: 600 }}>

              {/* Main browser mockup — perspective tilted + dock glow */}
              <div className="dock-glow-wrap mockup-perspective w-full" style={{ maxWidth: 620 }}>
                <div className="mockup-shell mac-window-shadow">

                  {/* Chrome */}
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-[#f8f8f8] border-b border-gray-200/80">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    <div className="flex-1 mx-3 bg-white border border-gray-200 rounded-md px-3 py-1.5 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0" />
                      <span className="text-[11px] text-gray-400 font-mono tracking-tight">sheetform.app/f/early-access</span>
                      <div className="ml-auto flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-600 font-semibold">Live</span>
                      </div>
                    </div>
                  </div>

                  {/* App content: two columns */}
                  <div className="flex" style={{ minHeight: 420 }}>

                    {/* Sidebar */}
                    <div className="w-52 border-r border-gray-100 bg-gray-50/60 p-4 flex-shrink-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Fields</p>
                      <div className="space-y-1">
                        {[
                          { l: "Full Name",  ic: "Aa", bg: "bg-violet-100", tc: "text-violet-700", active: true  },
                          { l: "Work Email", ic: "@",  bg: "bg-blue-100",   tc: "text-blue-700",   active: false },
                          { l: "Company",   ic: "⌂",  bg: "bg-sky-100",    tc: "text-sky-700",    active: false },
                          { l: "Team size", ic: "▾",  bg: "bg-amber-100",  tc: "text-amber-700",  active: false },
                          { l: "Message",   ic: "¶",  bg: "bg-rose-100",   tc: "text-rose-700",   active: false },
                        ].map(({ l, ic, bg, tc, active }) => (
                          <div key={l} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer ${active ? "bg-violet-600 shadow-sm" : "hover:bg-white"}`}>
                            <span className={`w-5 h-5 rounded-md text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${active ? "bg-white/20 text-white" : `${bg} ${tc}`}`}>
                              {ic}
                            </span>
                            <span className={`text-[11px] font-medium truncate ${active ? "text-white" : "text-gray-600"}`}>{l}</span>
                            {active && <div className="ml-auto w-1 h-1 rounded-full bg-white/60" />}
                          </div>
                        ))}
                        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-dashed border-gray-200 mt-1 cursor-pointer hover:border-violet-300 transition-colors">
                          <span className="text-gray-400 text-[14px] leading-none">+</span>
                          <span className="text-[11px] text-gray-400 font-medium">Add field</span>
                        </div>
                      </div>

                      {/* Sheet connected */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Connected Sheet</p>
                        <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-2 border border-gray-200 shadow-sm">
                          <div className="w-5 h-5 bg-emerald-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="text-emerald-700 text-[8px] font-black">G</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-gray-800 truncate">Signups 2024</p>
                            <p className="text-[9px] text-gray-400">Sheet1</p>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Preview canvas */}
                    <div className="flex-1 bg-[#F7F7FB] flex items-center justify-center p-6">
                      <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-gray-100 overflow-hidden">
                        {/* Form header bar */}
                        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #7c3aed, #4f46e5, #0ea5e9)" }} />
                        <div className="p-5">
                          <h3 className="text-[14px] font-bold text-gray-900 mb-0.5">Early Access</h3>
                          <p className="text-[11px] text-gray-400 mb-4">Join 1,200+ teams already using SheetForm.</p>

                          <div className="space-y-3">
                            {/* Active field with cursor */}
                            <div>
                              <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                                Full Name <span className="text-red-400">*</span>
                              </label>
                              <div className="h-8 bg-white border-2 border-violet-500 rounded-xl px-3 flex items-center shadow-sm shadow-violet-100">
                                <span className="text-[12px] text-gray-700">Jordan Smith</span>
                                <span className="ml-px w-0.5 h-3.5 bg-violet-500 animate-blink flex-shrink-0" />
                              </div>
                            </div>
                            {/* Filled field */}
                            <div>
                              <label className="text-[10px] font-semibold text-gray-600 block mb-1">Work Email</label>
                              <div className="h-8 bg-gray-50 border border-gray-200 rounded-xl px-3 flex items-center">
                                <span className="text-[11px] text-gray-500">jordan@company.com</span>
                                <svg className="ml-auto w-3.5 h-3.5 text-emerald-500 flex-shrink-0" viewBox="0 0 14 14" fill="none">
                                  <circle cx="7" cy="7" r="6.5" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="1"/>
                                  <path d="M4 7l2 2 4-4" stroke="#059669" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </div>
                            {/* Empty field */}
                            <div>
                              <label className="text-[10px] font-semibold text-gray-600 block mb-1">Company</label>
                              <div className="h-8 bg-gray-50 border border-gray-200 rounded-xl" />
                            </div>
                            {/* Submit */}
                            <div className="h-9 rounded-xl flex items-center justify-center mt-1"
                              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                              <span className="text-white text-[12px] font-bold tracking-wide">Submit →</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Liquid Glass card: macOS notification ── */}
              <div className="mac-glass animate-float-a absolute rounded-[18px] px-4 py-3"
                style={{ top: 20, right: -28, zIndex: 20, whiteSpace: "nowrap" }}>
                {/* z-index 1 so grain ::before doesn't cover content */}
                <div className="relative z-[2] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)", border: "1px solid #6ee7b7" }}>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-900 leading-tight">New submission</p>
                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Jordan Smith · just now</p>
                  </div>
                  <div className="ml-3 flex flex-col items-center gap-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* ── Liquid Glass card: live sheet rows ── */}
              <div className="mac-glass animate-float-b absolute rounded-[18px] p-3.5"
                style={{ bottom: 36, left: -36, zIndex: 20, minWidth: 224 }}>
                <div className="relative z-[2]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)", border: "1px solid #6ee7b7" }}>
                      <span className="text-emerald-700 text-[9px] font-black">G</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-800 flex-1">Live in Sheets</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    {[
                      { n: "Jordan S.", t: "now",   hi: true  },
                      { n: "Priya N.",  t: "1m ago", hi: false },
                      { n: "Sam K.",    t: "3m ago", hi: false },
                    ].map(({ n, t, hi }) => (
                      <div key={n} className={`flex items-center gap-2 text-[11px] py-1 px-2 rounded-xl transition-colors ${hi ? "bg-emerald-50/80" : ""}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${hi ? "bg-emerald-200 text-emerald-800" : "bg-black/[0.06] text-gray-500"}`}>
                          {n[0]}
                        </div>
                        <span className={`font-medium flex-1 ${hi ? "text-emerald-800" : "text-gray-600"}`}>{n}</span>
                        <span className={`text-[10px] font-semibold ${hi ? "text-emerald-500" : "text-gray-400"}`}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Liquid Glass card: stat counter ── */}
              <div className="mac-glass animate-float-c absolute rounded-[18px] px-4 py-3.5"
                style={{ top: "42%", right: -40, zIndex: 20, whiteSpace: "nowrap" }}>
                <div className="relative z-[2]">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">This month</p>
                  <p className="text-[28px] font-extrabold text-[#111111] animate-count-up leading-none tracking-tight">4,291</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ↑ 18%
                    </span>
                    <span className="text-[11px] text-gray-400">vs last month</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════
          LOGO / TRUST BAR
      ════════════════════════════════════════ */}
      <section className="py-16 border-y border-gray-100 overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center mb-8">
          <p className="text-sm text-gray-400 font-medium">Trusted by teams at companies like</p>
        </div>
        <div className="relative flex">
          <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
            {["Stripe", "Notion", "Linear", "Vercel", "Framer", "Loom", "Retool", "Zapier", "Webflow", "Airtable",
              "Stripe", "Notion", "Linear", "Vercel", "Framer", "Loom", "Retool", "Zapier", "Webflow", "Airtable"].map((name, i) => (
              <span key={i} className="text-[15px] font-bold text-gray-300 tracking-tight hover:text-gray-500 transition-colors cursor-default select-none">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════
          FEATURES — ALTERNATING ROWS
      ════════════════════════════════════════ */}
      <section id="features" className="px-6">
        <div className="max-w-6xl mx-auto">

          {/* ── Row 1: Form builder (text left, mockup right) ── */}
          <div className="feature-row">
            <div>
              <SectionTag>Form Builder</SectionTag>
              <h2 className="mt-5 text-[40px] lg:text-[48px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#111111] mb-5">
                Build forms people
                <br />actually enjoy filling
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
                A visual, step-by-step wizard that lets you add and arrange fields, set validation, and write your own thank-you message — all without touching a line of code.
              </p>
              <ul className="space-y-3.5 mb-8">
                {[
                  "6 field types: text, email, phone, dropdown, checkbox, date",
                  "Map each field to a specific spreadsheet column",
                  "Live preview updates as you build",
                  "Custom button labels and post-submit redirect",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <Check /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn-dark px-7 py-3.5 text-sm">
                Start building →
              </Link>
            </div>

            {/* Mockup */}
            <div className="animate-float">
              <div className="mockup-shell">
                <MockupBar />
                <div className="p-6 bg-[#FAFAFA]">
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-6">
                    {[1,2,3].map((n) => (
                      <div key={n} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center ${n === 2 ? "bg-violet-600 text-white" : n < 2 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                          {n < 2 ? "✓" : n}
                        </div>
                        <span className={`text-[11px] font-medium ${n === 2 ? "text-violet-700" : "text-gray-400"} hidden sm:block`}>
                          {["Connect Sheet","Add Fields","Publish"][n-1]}
                        </span>
                        {n < 3 && <div className={`w-8 h-px ${n < 2 ? "bg-emerald-300" : "bg-gray-200"}`} />}
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] font-bold text-gray-800 mb-4">Add fields to your form</p>
                  <div className="space-y-2.5">
                    {[
                      { l: "Full Name",    t: "Short Text", c: "bg-violet-100 text-violet-600", req: true },
                      { l: "Email",        t: "Email",      c: "bg-blue-100 text-blue-600",     req: true },
                      { l: "How did you find us?", t: "Dropdown", c: "bg-amber-100 text-amber-600", req: false },
                    ].map(({ l, t, c, req }) => (
                      <div key={l} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${c}`}>{t}</span>
                        <span className="text-[13px] font-medium text-gray-800 flex-1">{l}</span>
                        {req && <span className="text-[10px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded">REQ</span>}
                        <span className="text-gray-300 cursor-grab">⠿</span>
                      </div>
                    ))}
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-[12px] text-gray-400 font-medium hover:border-violet-300 hover:text-violet-500 transition-all">
                      + Add another field
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ── Row 2: Sheets sync (mockup left, text right) ── */}
          <div className="feature-row">
            {/* Mockup first on mobile, second on desktop */}
            <div className="order-2 md:order-1 animate-float" style={{ animationDelay: "0.5s" }}>
              <div className="mockup-shell">
                <MockupBar />
                <div className="p-5">
                  {/* Spreadsheet-like UI */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-700 text-[10px] font-black">G</span>
                    </div>
                    <span className="text-[12px] font-bold text-gray-800">Early Access Responses · Sheet1</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] text-emerald-600 font-semibold">Live</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden text-[11px]">
                    {/* Header */}
                    <div className="grid grid-cols-4 bg-gray-100 text-gray-500 font-bold">
                      {["Name", "Email", "Source", "Time"].map((h) => (
                        <div key={h} className="px-3 py-2 border-r last:border-0 border-gray-200">{h}</div>
                      ))}
                    </div>
                    {/* Rows */}
                    {[
                      { n: "Jordan S.", e: "jordan@co.io", s: "Website",   t: "just now",  hi: true },
                      { n: "Priya N.",  e: "priya@co.io",  s: "Embed",     t: "1 min ago", hi: false },
                      { n: "Sam K.",    e: "sam@co.io",    s: "Website",   t: "3 min ago", hi: false },
                      { n: "Alex C.",   e: "alex@co.io",   s: "Direct",    t: "5 min ago", hi: false },
                      { n: "Mia W.",    e: "mia@co.io",    s: "Website",   t: "8 min ago", hi: false },
                    ].map(({ n, e, s, t, hi }) => (
                      <div
                        key={n}
                        className={`grid grid-cols-4 border-t border-gray-100 ${hi ? "bg-emerald-50" : "hover:bg-gray-50"}`}
                      >
                        <div className={`px-3 py-2 border-r border-gray-100 font-medium truncate ${hi ? "text-emerald-800" : "text-gray-800"}`}>{n}</div>
                        <div className={`px-3 py-2 border-r border-gray-100 truncate ${hi ? "text-emerald-600" : "text-gray-500"}`}>{e}</div>
                        <div className="px-3 py-2 border-r border-gray-100 text-gray-500 truncate">{s}</div>
                        <div className={`px-3 py-2 truncate ${hi ? "text-emerald-600 font-semibold" : "text-gray-400"}`}>{t}</div>
                      </div>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Today",     val: "127" },
                      { label: "This week", val: "843" },
                      { label: "All time",  val: "4.2K" },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <p className="text-[18px] font-extrabold text-[#111111]">{val}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <SectionTag>Google Sheets Sync</SectionTag>
              <h2 className="mt-5 text-[40px] lg:text-[48px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#111111] mb-5">
                Every submission,
                <br />instantly in your Sheet
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
                Each time someone submits your form, a new row is appended to your Google Spreadsheet in under 200 ms. Your data is always current — no imports, no exports, no delays.
              </p>
              <ul className="space-y-3.5 mb-8">
                {[
                  "Appends directly using Google Sheets API v4",
                  "OAuth2 with offline access — tokens auto-refresh",
                  "Works with any spreadsheet in your Google Drive",
                  "Timestamp added automatically to every row",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <Check /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn-dark px-7 py-3.5 text-sm">
                Connect your Sheet →
              </Link>
            </div>
          </div>


          {/* ── Row 3: Embed (text left, mockup right) ── */}
          <div className="feature-row" style={{ borderBottom: "none" }}>
            <div>
              <SectionTag>Embed &amp; Share</SectionTag>
              <h2 className="mt-5 text-[40px] lg:text-[48px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#111111] mb-5">
                Share a link.
                <br />Embed anywhere.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
                Every form gets a hosted URL you can share directly. Drop one script tag on any HTML page and your form appears inline — no React, no framework, no configuration.
              </p>
              <ul className="space-y-3.5 mb-8">
                {[
                  "Hosted at sheetform.app/f/your-form-id",
                  "Embed script works in Webflow, Framer, raw HTML",
                  "Responsive and mobile-optimized by default",
                  "Honeypot spam protection built in",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <Check /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn-dark px-7 py-3.5 text-sm">
                Get your form link →
              </Link>
            </div>

            <div className="animate-float" style={{ animationDelay: "1s" }}>
              <div className="mockup-shell">
                <MockupBar />
                <div className="p-6 space-y-4">
                  {/* Hosted URL card */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Hosted URL</p>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400 shrink-0">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M4 7a9.5 9.5 0 003 0M3 5h8M3 9h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      <span className="text-[12px] text-gray-700 font-mono flex-1">sheetform.app/f/<span className="text-violet-600 font-bold">abc123</span></span>
                      <button className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg hover:bg-violet-100 transition-colors">
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Embed code card */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Embed snippet</p>
                    <div className="bg-[#0f0f0f] rounded-xl p-4 font-mono text-[12px] leading-6">
                      <span className="text-gray-500">&lt;</span>
                      <span className="text-[#7dd3fc]">script</span>
                      <br />
                      <span className="text-[#c4b5fd] ml-4">src</span>
                      <span className="text-gray-500">=</span>
                      <span className="text-[#86efac]">&quot;sheetform.app/embed.js&quot;</span>
                      <br />
                      <span className="text-[#c4b5fd] ml-4">data-form-id</span>
                      <span className="text-gray-500">=</span>
                      <span className="text-[#86efac]">&quot;abc123&quot;</span>
                      <br />
                      <span className="text-gray-500">&gt;&lt;/</span>
                      <span className="text-[#7dd3fc]">script</span>
                      <span className="text-gray-500">&gt;</span>
                    </div>
                  </div>

                  {/* Works with bar */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Works with</p>
                    <div className="flex flex-wrap gap-2">
                      {["Webflow", "Framer", "WordPress", "HTML", "React"].map((p) => (
                        <span key={p} className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ════════════════════════════════════════
          HOW IT WORKS — NUMBERED STEPS
      ════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 px-6 bg-[#FAFAFA] border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <SectionTag>How it works</SectionTag>
            <h2 className="mt-5 text-[40px] lg:text-[52px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#111111]">
              Up and running
              <br />in 3 steps
            </h2>
            <p className="mt-4 text-gray-500 text-lg">No engineers required. Seriously.</p>
          </div>

          <div className="space-y-5">
            {[
              {
                n: "1",
                title: "Connect a Google Sheet",
                desc: "Sign in with Google, pick any spreadsheet from your Drive, and choose which tab to use as your data destination. We request exactly the permissions needed — nothing more.",
                detail: "Supports all Google Sheets · Read and write access · Multiple tabs",
              },
              {
                n: "2",
                title: "Build your form visually",
                desc: "Use the step-by-step builder to add fields, map each one to a column in your spreadsheet, write a custom thank-you message, and set up email notifications — all in a few clicks.",
                detail: "6 field types · Live preview · No-code setup",
              },
              {
                n: "3",
                title: "Share the link or embed it",
                desc: "Your form gets an instant hosted URL. Share it directly, or embed it anywhere on the web with a single script tag. Every submission appears as a new row in your sheet immediately.",
                detail: "Hosted URL · Embed script · Spam protection included",
              },
            ].map(({ n, title, desc, detail }) => (
              <div key={n} className="bg-white border border-gray-200 rounded-2xl p-8 flex gap-6 hover:border-violet-200 hover:shadow-md transition-all">
                <div className="step-number shrink-0 mt-0.5">{n}</div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#111111] mb-2">{title}</h3>
                  <p className="text-gray-500 text-[15px] leading-relaxed mb-3">{desc}</p>
                  <p className="text-[12px] text-violet-600 font-semibold bg-violet-50 inline-block px-3 py-1 rounded-full border border-violet-100">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════
          SOCIAL PROOF — QUOTES
      ════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[40px] lg:text-[48px] font-extrabold tracking-[-0.025em] text-[#111111]">
              95% of teams collect
              <br />
              <span className="text-[#7c3aed]">more data with less effort</span>
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote: "We replaced a $200/month form tool with SheetForm in 20 minutes. The data goes straight into the spreadsheet our ops team already lives in.",
                name: "Sarah K.",
                role: "Head of Operations",
                co: "Fintech startup",
                avatar: "#7c3aed",
              },
              {
                quote: "I embedded it on our Webflow site with one script tag. Took longer to make coffee. Submissions started appearing in our Sheet before I finished my cup.",
                name: "Marcus T.",
                role: "Founder",
                co: "Design agency",
                avatar: "#0284c7",
              },
              {
                quote: "Finally a form tool that doesn't try to be a CRM. It just puts data in my spreadsheet. That's all I needed.",
                name: "Priya R.",
                role: "Product Manager",
                co: "SaaS company",
                avatar: "#059669",
              },
            ].map(({ quote, name, role, co, avatar }) => (
              <div key={name} className="quote-card p-7">
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#f59e0b">
                      <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1-3-2.9 4.2-.8z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold" style={{ background: avatar }}>
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#111111]">{name}</p>
                    <p className="text-[12px] text-gray-400">{role} · {co}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════
          PRICING
      ════════════════════════════════════════ */}
      <section id="pricing" className="py-28 px-6 bg-[#FAFAFA] border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionTag>Pricing</SectionTag>
            <h2 className="mt-5 text-[40px] lg:text-[52px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#111111]">
              Simple, honest pricing
            </h2>
            <p className="mt-4 text-gray-500 text-lg">Start free. Upgrade when your forms grow with you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-start">
            {/* Free */}
            <div className="price-card">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Free</p>
              <div className="mb-1">
                <span className="text-[48px] font-extrabold text-[#111111] tracking-tight">$0</span>
              </div>
              <p className="text-gray-500 text-sm mb-7">For individuals just getting started.</p>
              <div className="h-px bg-gray-100 mb-7" />
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "1 form",
                  "100 submissions / month",
                  "Hosted form URL",
                  "Google Sheets sync",
                  "Spam protection",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[14px] text-gray-600">
                    <Check /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn-outline text-[14px] px-6 py-3.5 w-full justify-center">
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="price-card price-card-pro shadow-[0_24px_64px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pro</p>
                <span className="text-[11px] font-bold bg-violet-500 text-white px-3 py-1 rounded-full">Most popular</span>
              </div>
              <div className="mb-1">
                <span className="text-[48px] font-extrabold text-white tracking-tight">$9</span>
                <span className="text-gray-400 text-sm ml-1">/month</span>
              </div>
              <p className="text-gray-400 text-sm mb-7">For professionals and growing teams.</p>
              <div className="h-px bg-white/10 mb-7" />
              <ul className="space-y-4 mb-8">
                {[
                  "Unlimited forms",
                  "10,000 submissions / month",
                  "Email notifications",
                  "Custom redirect URL",
                  "Remove SheetForm branding",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[14px] text-gray-300">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                      <circle cx="9" cy="9" r="9" fill="rgba(255,255,255,0.1)" />
                      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn-purple text-[14px] px-6 py-3.5 w-full justify-center">
                Start Pro trial →
              </Link>
            </div>

            {/* Agency */}
            <div className="price-card">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Agency</p>
              <div className="mb-1">
                <span className="text-[48px] font-extrabold text-[#111111] tracking-tight">$25</span>
                <span className="text-gray-400 text-sm ml-1">/month</span>
              </div>
              <p className="text-gray-500 text-sm mb-7">For agencies and high-volume users.</p>
              <div className="h-px bg-gray-100 mb-7" />
              <ul className="space-y-4 mb-8">
                {[
                  "Unlimited forms",
                  "Unlimited submissions",
                  "White-label embed",
                  "Priority support",
                  "Team access",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[14px] text-gray-600">
                    <Check /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn-outline text-[14px] px-6 py-3.5 w-full justify-center">
                Start Agency
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-[#111111] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-6">Get started today</p>
          <h2 className="text-[52px] lg:text-[68px] font-extrabold leading-[1.04] tracking-[-0.03em] mb-7">
            Your first form is
            <br />
            <span className="text-[#a78bfa]">free forever.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto mb-10">
            No contracts, no credit card, no engineering work. Connect your Sheet and go live in under two minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login" className="btn-purple px-9 py-4 text-base">
              Create a form — it&apos;s free
            </Link>
            <a href="#features" className="text-[15px] text-gray-500 hover:text-gray-300 font-medium transition-colors">
              See all features →
            </a>
          </div>
          <p className="text-gray-600 text-sm mt-8">No credit card · Cancel anytime · Up in 2 minutes</p>
        </div>
      </section>


      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="bg-[#0a0a0a] border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-white/10 rounded-xl flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" />
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.4" />
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.4" />
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-white text-[15px]">SheetForm</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              The form builder that speaks Google Sheets.
            </p>
          </div>

          {/* Links */}
          {[
            { heading: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { heading: "Legal",   links: ["Privacy", "Terms", "Security", "Support"] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4">{heading}</p>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors font-medium">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-600">© 2024 SheetForm, Inc. All rights reserved.</p>
          <p className="text-sm text-gray-600">Made with ❤️ for spreadsheet lovers</p>
        </div>
      </footer>

    </div>
  );
}
