# JNV Smart Connect

A School ERP for Jawahar Navodaya Vidyalayas — role-based dashboards, student and
teacher records, notifications, and secure authentication, built on Next.js 16
(App Router), MongoDB/Mongoose, and shadcn-style UI over Tailwind CSS v4.

## Tech stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, React Hook Form,
  Zod, TanStack Query, Framer Motion, Recharts, next-themes, Lucide icons
- **Backend**: Next.js Route Handlers, MongoDB/Mongoose, JWT auth (access + refresh
  cookies), bcrypt, RBAC, Nodemailer, Cloudinary-ready

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
   secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`). SMTP is optional in
   development — email sends are skipped (and logged) if `SMTP_HOST` isn't set.

3. Seed an initial school, academic year, classes/sections, core subjects, and a
   Super Admin login:

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

   Open [http://localhost:3000](http://localhost:3000) and sign in with the seeded
   Super Admin account.

## Other scripts

- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript, no emit

## Architecture

- `src/app` — routes (App Router), grouped into `(auth)` (login/forgot/reset) and
  `dashboard` (role-aware, protected)
- `src/app/api` — Route Handlers, thin: parse + validate, call a controller
- `src/controllers` — business logic, one per domain (auth, student, teacher, …)
- `src/middlewares` — `withAuth` / `withPermission` (RBAC guards) and centralized
  error handling for Route Handlers
- `src/models` — Mongoose schemas
- `src/validators` — Zod schemas shared by API routes and client forms
- `src/lib/auth` — JWT, password hashing, session cookies, the RBAC permission
  matrix, and the server-side Data Access Layer (`dal.ts`)
- `src/services` — client-side fetch wrappers consumed by TanStack Query hooks
  in `src/hooks`
- `src/components` — `ui` (design-system primitives), `layout` (shell/nav),
  and feature folders (`students`, `teachers`, `dashboard`, `auth`, …)
- `src/proxy.ts` — Next.js 16 Proxy (formerly Middleware): optimistic auth +
  RBAC redirects, re-checked server-side on every protected page/route

## Roles

Super Admin, Principal, Vice Principal, Teacher, Hostel Warden, Accountant,
Librarian, Parent, Student — see `src/types/roles.ts` and
`src/lib/auth/rbac.ts` for the full permission matrix.

## Status

Fully built: authentication (login/forgot/reset password), RBAC, role
dashboards, notifications, activity logs, profile/password management, and
full Students and Teachers CRUD.

Scaffolded with a "coming soon" placeholder (routes and RBAC guards exist,
UI is pending): Parents directory, Classes/Sections/Subjects management,
Attendance, Homework, Exams, Library, Hostel, Accounts, School settings.
