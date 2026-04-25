# SheetForm — Claude Code Instructions

## Project overview
SheetForm is a micro-SaaS that lets users connect Google Sheets, build forms visually, and collect real-time submissions. Built with Next.js 14 App Router, TypeScript strict mode, Tailwind CSS, MongoDB/Mongoose, NextAuth.js (Google OAuth), Google Sheets API v4, and Resend.

---

## Stack & key libraries

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router (`app/` dir) |
| Language | TypeScript — strict mode, zero `any` |
| Styling | Tailwind CSS + custom classes in `app/globals.css` |
| Database | MongoDB via Mongoose (`lib/mongodb.ts` — global cache) |
| Auth | NextAuth.js v4 — Google provider with offline access |
| Google APIs | `googleapis` — Sheets v4, Drive v3 |
| Email | Resend (`lib/email.ts`) |
| ID generation | `lib/nanoid.ts` — custom short IDs for `formId` |

---

## Directory map

```
app/
  page.tsx          Landing page (macOS-inspired, aurora + liquid glass)
  layout.tsx        Root layout with SessionProvider
  globals.css       ALL custom CSS — animations, macOS effects, UI primitives
  providers.tsx     NextAuth SessionProvider wrapper
  login/            Google sign-in page
  dashboard/        Authenticated form list
  builder/          4-step form builder
  settings/         Per-form settings + danger zone
  f/[formId]/       Public form render + submission
  api/
    auth/[...nextauth]/   NextAuth route + options.ts
    forms/          GET all forms, POST create form
    forms/[id]/     PATCH (toggle active), DELETE
    sheets/         GET user spreadsheets + tabs
    submit/[formId] POST — public submission endpoint

components/builder/
  StepConnectSheet.tsx   Step 1: pick spreadsheet + tab
  StepAddFields.tsx      Step 2: add/reorder fields
  StepCustomize.tsx      Step 3: labels, button, redirect
  StepPublish.tsx        Step 4: embed snippet + form URL

lib/
  mongodb.ts   Mongoose connection with global cache (TypeScript-safe)
  google.ts    OAuth client, auto-refresh, Sheets/Drive helpers
  email.ts     Resend notification helper
  auth.ts      getServerSession helper
  nanoid.ts    Short ID generator

models/
  User.ts        plan, googleTokens, submissionCount, submissionResetDate
  Form.ts        fields[], sheetId, sheetName, formId, isActive
  Submission.ts  formId, data (Mixed), submittedAt

public/
  embed.js     Reads data-form-id, injects iframe with postMessage resize
```

---

## Environment variables (`.env.local`)

```
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MONGODB_URI=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=
```

Never commit `.env.local`. Never read or log `refresh_token` values.

---

## Auth & Google tokens

- Google OAuth uses `access_type: "offline"` + `prompt: "consent"` to force a `refresh_token` on every sign-in.
- Tokens stored on the `User` document: `googleTokens.{ access_token, refresh_token, expiry_date }`.
- `lib/google.ts → getAuthenticatedClient()` auto-refreshes when `Date.now() > expiry_date - 60_000`. Always call this — never construct an OAuth client with raw credentials outside this helper.
- If a user loses their `refresh_token`, they must re-authenticate. Surface the error clearly rather than silently failing.

---

## Data & plan limits

| Plan | Forms | Submissions/month |
|---|---|---|
| `free` | 1 | 100 |
| `pro` | unlimited | unlimited |
| `agency` | unlimited | unlimited |

- Form count is checked in `POST /api/forms`.
- Submission count is checked in `POST /api/submit/[formId]` against `user.submissionCount`. Monthly reset compares `getMonth()` / `getFullYear()` on `submissionResetDate`.
- Honeypot: hidden `company` field in every public form. If non-empty, return `{ success: true }` silently.

---

## Submission flow (critical path)

```
POST /api/submit/[formId]
  1. Honeypot check (company field)
  2. Fetch Form doc → verify isActive
  3. Fetch User doc → plan limit check + monthly reset
  4. Map fields → rowValues[] (order matches sheet columns), append ISO timestamp
  5. appendToSheet() → spreadsheets.values.append USER_ENTERED
  6. Save Submission doc
  7. sendSubmissionNotification() if emailNotifications enabled
```

Do not reorder these steps. Sheet append must happen before Submission save so a DB failure doesn't silently drop a row.

---

## CSS conventions

All custom CSS lives in `app/globals.css` — do not add `<style>` tags or CSS modules unless unavoidable.

### macOS effect classes (do not rename or remove)

| Class | What it does |
|---|---|
| `.aurora-bg` | Section wrapper — off-white base for orbs to blur into |
| `.aurora-orb-1/2/3/4` | Absolutely positioned blurred radial-gradient orbs |
| `.mac-glass` | Liquid Glass card — frosted blur + specular border + SVG grain noise |
| `.mac-window-shadow` | Multi-layer realistic macOS window shadow with violet ambient glow |
| `.dock-glow-wrap` | Wrapper that adds radial purple glow pool below its content via `::after` |
| `.mockup-perspective` | 3-D tilted mockup with spring-physics hover (`cubic-bezier(0.34,1.56,0.64,1)`) |
| `.animate-float-a/b/c` | Floating card animations with subtle rotation |
| `.animate-count-up` | Entrance animation for stat numbers |

### Design tokens
- **Primary accent:** `#7c3aed` (violet-700) and `#6d28d9` (violet-800)
- **Text:** `#111111` dark, `#6b7280` muted
- **Button variants:** `.btn-dark`, `.btn-outline`, `.btn-purple` — all pill-shaped (`border-radius: 100px`)
- **Font:** `-apple-system, "Inter", "Segoe UI", sans-serif`

---

## TypeScript rules

- Zero `any` — use proper interfaces or `Record<string, unknown>`.
- Catch blocks: `err instanceof Error ? err.message : "Unknown error"`.
- Mongoose globals: use `declare global { var mongooseCache: MongooseCache | undefined }` pattern — not `(global as any)`.
- `useSession()` — destructure only what you use: `const { status } = useSession()` if `data` is unused.

---

## API route conventions

- All routes are in `app/api/` and use the Route Handler pattern (`export async function GET/POST/PATCH/DELETE`).
- Always call `getServerSession()` at the top and return 401 if null.
- Return consistent JSON shapes: `{ form }`, `{ forms }`, `{ error: string }`.
- HTTP status codes: 400 bad input, 401 unauth, 403 plan limit, 404 not found, 429 submission limit.

---

## Commands

```bash
npm run dev      # local dev on :3000
npm run build    # must pass before any feature is considered done
npm run lint     # ESLint — must be clean (no warnings suppressed unless justified)
```

Always run `npm run build` after significant changes to confirm clean compilation.

---

## What NOT to do

- Do not mock MongoDB in tests — always use a real connection (no mocks have been set up; add real integration tests only).
- Do not add `// @ts-ignore` or `eslint-disable` lines without a documented reason.
- Do not store tokens in client-side state or `localStorage`.
- Do not add new dependencies without checking if something in the existing stack already covers it.
- Do not create new CSS files or CSS modules — extend `globals.css`.
- Do not change the `formId` generation strategy (nanoid) without migrating existing form URLs.
