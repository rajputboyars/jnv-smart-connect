# Roadmap

This document is deliberately honest about three tiers: what's **built and
real**, what's **built as a deliberately scoped-down version** of a bigger
ask, and what's **deferred** with a stated reason. Nothing below claims a
capability that isn't actually in the code.

## Built (production-ready today)

- **Core ERP**: Auth (login/refresh/forgot/reset), RBAC across 9 roles,
  Students/Teachers/Parents CRUD, Academic Years/Classes/Sections/Subjects,
  Teacher allocation.
- **Attendance**: manual + bulk marking (students and staff), QR
  self-check-in, calendar history, aggregate reports, Excel/PDF export.
- **Hostel**: buildings/rooms/bed allocation, nightly roll-call, leave
  requests, gate passes, visitor log.
- **Health**: medicine administration log, doctor visit log, a combined
  medical report endpoint scoped per-role (self/child/taught-class/
  school-wide, see `docs/API.md`).
- **Library**: book catalog with real Code128 barcodes, issue/return with
  automatic overdue fine calculation.
- **Notifications**: role/class/section/user-targeted broadcast with
  read-receipts.
- **Security**: sliding-window rate limiting, Origin/Referer CSRF checks on
  every mutating request, security response headers (CSP/HSTS in
  production), silent access-token refresh, failed-login audit trail.
- **Analytics dashboard**: attendance/hostel/library/health trend charts
  computed from this app's own MongoDB data (Recharts).
- **Multi-tenancy foundation**: every collection is already `school`-scoped
  and indexed for it (see `docs/DATABASE.md` and the section below).
- **Docs, Docker, PWA basics, and a real test suite** — see the rest of this
  repo's `docs/` folder and root config files.

## Scoped down from the original ask (and why)

| Asked for | What's actually built | Why |
|---|---|---|
| "AI-powered dropout prediction / at-risk student prediction" | A **rule-based risk score** (`src/lib/ai/risk-scoring.ts`): weighted combination of attendance rate, hostel leave frequency, library non-return rate, and health-visit frequency, all computed from real data with a transparent formula | There is no labeled historical outcome data (whether a flagged student actually dropped out) to train or validate a real ML classifier on. Calling a hand-tuned weighted score "AI-predicted" would be dishonest. The formula and weights are visible in the code and adjustable by a school administrator, which is more auditable than an opaque model would be anyway. |
| "AI report card narrative / homework generator / parent summary / teacher chatbot" | Real calls to the Claude API (`ANTHROPIC_API_KEY`-gated), grounded in this student's actual attendance/grades/notes — not fabricated | These generate real text via a real model; scoped down only in that they require an API key (no local model ships) and are best-effort (rate-limited, and degrade to a clear "AI features aren't configured" message if the key is absent) rather than always-on. |
| "Offline-first, full background sync engine" | A **PWA app shell** (installable, offline fallback page, static asset caching via a service worker) | A real offline-first data layer needs a conflict-resolution strategy for every mutation (what happens when two staff mark the same student present differently while offline?) that touches every controller in the app. Building that shallowly (cache GETs, silently drop conflicting offline POSTs) would be worse than not claiming it — see "Deferred" below for what a real implementation needs. |
| "Multi-tenant architecture for thousands of schools" | The **data model** is multi-tenant today (every collection scoped + indexed by `school`) | Actually onboarding thousands of schools needs tenant-aware routing (subdomain/path → tenant resolution), per-tenant rate-limit/billing isolation, and a provisioning flow — infrastructure decisions (subdomain wildcard DNS + TLS, billing provider, support tooling) that are a product/ops project, not a code change this repo can decide unilaterally. The schema won't need to change when that's built. |
| "Deploy to production (live URL)" | Docker Compose + a documented Vercel/Atlas path (`docs/DEPLOYMENT.md`) | Actually deploying requires the operator's own domain, TLS cert, hosting account, and secrets — none of which this codebase can create on someone's behalf. |

## Deferred (not started, tracked here on purpose)

- **Homework, Exams, Accounts & fees** — these pages exist today as
  permission-gated "Coming Soon" placeholders (`src/app/dashboard/homework`,
  `.../exams`, `.../accounts`). They were out of scope for this phase's
  security/analytics/AI/deployment focus and deserve the same full
  CRUD-with-real-data treatment the other modules got, as their own
  dedicated pass.
- **True ML-based prediction** — once the app has run for a full academic
  year or two, real historical labels exist (did a flagged student actually
  leave, fail, or improve). At that point a real trained model
  (gradient-boosted trees on the same attendance/health/library features the
  rule-based score already computes) becomes honestly buildable, and the
  rule-based score's weights are a reasonable initial feature set.
- **Full offline sync engine** — needs, per module: an IndexedDB mirror of
  the relevant collections, a mutation outbox with optimistic UI, and a
  server-side conflict policy (last-write-wins is wrong for attendance;
  most fields need "reject and surface to the user" instead). This is a
  cross-cutting redesign of every mutation hook in `src/hooks`, not a
  bolt-on.
- **Multi-tenant SaaS routing/billing** — subdomain-per-school routing in
  `proxy.ts`, a tenant-provisioning admin flow, per-tenant usage metering,
  and a billing integration.
- **Distributed rate limiting** — see
  [Deployment: single-instance limitation](./DEPLOYMENT.md#4-single-instance-limitation-read-this-before-scaling-out).
- **A dedicated `/api/health` liveness/readiness endpoint** for orchestrators
  (Kubernetes-style probes) — currently any authenticated `GET` doubles as one.

## Immediate next steps (recommended order)

1. Homework + Exams modules (highest user-facing gap — both already have
   RBAC permissions reserved and nav entries, just no data layer yet).
2. Accounts & fee management.
3. Real E2E coverage of the modules built in this phase (Hostel/Health/
   Library), beyond the login-flow smoke test currently in `e2e/`.
4. Revisit the rule-based risk score against a term's worth of real data
   before deciding whether a trained model is warranted.
