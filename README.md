# JNV Smart Connect

A production-ready School ERP for Jawahar Navodaya Vidyalayas — role-based
dashboards, Students/Teachers/Parents records, Academics, Attendance
(manual + QR), Hostel, Health, Library, Notifications, an analytics
dashboard, and Claude-powered AI assistance, built on Next.js 16 (App
Router), MongoDB/Mongoose, and shadcn-style UI over Tailwind CSS v4.

## Documentation

| Doc | Covers |
|---|---|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Layering, request-flow diagrams, the security boundary in `proxy.ts`, multi-tenancy design |
| [`docs/DATABASE.md`](./docs/DATABASE.md) | Every collection, the ER diagram, indexing strategy |
| [`docs/API.md`](./docs/API.md) | Every endpoint, its permission, its rate limit |
| [`docs/FOLDER_STRUCTURE.md`](./docs/FOLDER_STRUCTURE.md) | What lives where, naming conventions |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Docker Compose, Vercel/Atlas, env vars, scaling caveats |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | What's built vs. honestly scoped-down vs. deferred, and why |

## Tech stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, React
  Hook Form, Zod, TanStack Query, Framer Motion, Recharts, next-themes,
  Lucide icons
- **Backend**: Next.js Route Handlers, MongoDB/Mongoose, JWT auth (access +
  refresh cookies with silent refresh), bcrypt, RBAC, Nodemailer,
  Cloudinary (signed uploads), Anthropic Claude API (AI features)
- **Security**: sliding-window rate limiting, Origin/Referer CSRF checks,
  CSP/HSTS/security headers, audited RBAC data-scoping
- **Ops**: Docker (multi-stage, `output: "standalone"`), PWA (installable,
  offline app shell), Vitest unit tests, Playwright E2E

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

   At minimum you need a running MongoDB instance (`MONGODB_URI`) and two JWT
   secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`). SMTP, Cloudinary, and
   the Anthropic API key are all optional in development — each integration
   degrades gracefully (skipped-and-logged, or a clear "not configured"
   response) if its env vars are unset. See `docs/DEPLOYMENT.md` for the full
   variable reference.

3. Seed an initial school, academic year, classes/sections, core subjects, and
   a Super Admin login:

   ```bash
   npm run seed
   ```

   This prints the Super Admin email/password from `SEED_SUPER_ADMIN_EMAIL` /
   `SEED_SUPER_ADMIN_PASSWORD` (defaults are in `.env.example`) — change the
   password after first login.

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and sign in with the
   seeded Super Admin account.

### Running with Docker instead

```bash
docker compose up -d --build
```

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for the full walkthrough
(secrets, seeding inside the container, updating).

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` / `npm run start` — production build / run it
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript, no emit
- `npm test` — Vitest unit tests
- `npm run test:e2e` — Playwright E2E (starts the app itself)
- `npm run seed` — seed the initial school/admin

## Architecture at a glance

```
Route (app/api/**/route.ts)
  -> Middleware (withAuth / withPermission / withErrorHandling)
     -> Validator (Zod)
        -> Controller (business logic — the only layer touching models)
           -> Model (Mongoose schema)
```

`src/proxy.ts` (Next.js 16's renamed `middleware.ts`, running in the Node.js
runtime) is the single interception point for every request: rate limiting,
CSRF/origin verification, security headers, and — for page routes — the
optimistic auth/RBAC redirect (re-checked server-side on every protected
page via `src/lib/auth/dal.ts`, and independently by every API route's
`withPermission`, since a proxy matcher must never be the *only* thing
enforcing authorization). Full detail, with sequence diagrams, in
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Roles

Super Admin, Principal, Vice Principal, Teacher, Hostel Warden, Accountant,
Librarian, Parent, Student — see `src/types/roles.ts` and
`src/lib/auth/rbac.ts` for the full permission matrix.

## Status

See [`docs/ROADMAP.md`](./docs/ROADMAP.md) for the complete, honest
breakdown of what's built, what's a deliberately scoped-down version of a
bigger ask (and why), and what's deferred.

**Fully built**: Auth (incl. silent refresh), RBAC, role dashboards,
Students/Teachers/Parents CRUD, Academics, Attendance (manual/bulk/QR),
Hostel, Health, Library, Notifications, Activity Logs, Analytics dashboard,
AI features (Claude-gated) + rule-based risk scoring, security hardening,
Docker, PWA basics, and a Vitest + Playwright test suite.

**"Coming soon" placeholders** (RBAC-gated routes exist, no data layer yet):
Homework, Exams, Accounts & fees, School settings.
