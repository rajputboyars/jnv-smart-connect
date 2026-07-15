# API Reference

All endpoints are Next.js Route Handlers under `/api`. Every response is a
JSON envelope:

```ts
// success
{ success: true, message?: string, data: T }
// paginated success
{ success: true, data: T[], pagination: { page, limit, total, totalPages } }
// failure
{ success: false, message: string, details?: unknown }
```

Authentication is via httpOnly cookies (`jnv_access_token`,
`jnv_refresh_token`) — there is no `Authorization: Bearer` header. Request
bodies are validated with the Zod schema named alongside each route below
(`src/validators/*.validator.ts` is the source of truth for exact fields);
a failed validation returns `422` with `details` as a field-error map.

**Rate limits** (see `src/lib/security/rate-limit.ts`): `/api/auth/login`
10/15min, `/api/auth/register` 10/hr, `/api/auth/forgot-password` 5/15min,
`/api/auth/reset-password` 10/15min, `/api/auth/refresh` 20/min, everything
else under `/api` 300/min — all keyed per client IP. Exceeding a limit
returns `429` with a `Retry-After` header.

**CSRF**: any mutating request (`POST`/`PUT`/`PATCH`/`DELETE`) whose
`Origin`/`Referer` doesn't match the app's own origin is rejected with `403`
before it reaches the route handler.

## Auth — `/api/auth`

| Method | Path | Auth | Validator | Notes |
|---|---|---|---|---|
| POST | `/login` | public | `loginSchema` | Sets session cookies; logs `auth.login`/`auth.login_failed` |
| POST | `/register` | `withAuth` (creator must be signed in) | `registerSchema` | Staff account creation, sends welcome email |
| POST | `/logout` | public (no-op if no session) | — | Clears cookies |
| GET | `/me` | `withAuth` | — | Current user's profile |
| POST | `/refresh` | public (needs valid refresh cookie) | — | Silent token refresh, rotates both cookies |
| POST | `/forgot-password` | public | `forgotPasswordSchema` | Always returns the same message whether or not the email exists |
| POST | `/reset-password` | public | `resetPasswordSchema` | Consumes a single-use, hashed, time-boxed token |

## Users — `/api/users`

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/me` | `withAuth` | Full profile for the settings page |
| PATCH | `/me/password` | `withAuth` | Change own password (requires current password) |

## Students — `/api/students`

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/` | `STUDENTS_VIEW` | Paginated, filterable by class/section/status/search |
| POST | `/` | `STUDENTS_CREATE` | `createStudentSchema` |
| GET | `/[id]` | `STUDENTS_VIEW` | |
| PATCH | `/[id]` | `STUDENTS_UPDATE` | `updateStudentSchema` |
| DELETE | `/[id]` | `STUDENTS_DELETE` | |

## Teachers — `/api/teachers`

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/` | `TEACHERS_VIEW` | |
| POST | `/` | `TEACHERS_CREATE` | Provisions a linked `User` login |
| GET / PATCH / DELETE | `/[id]` | `TEACHERS_VIEW`/`UPDATE`/`DELETE` | |
| GET | `/allocations` | `TEACHERS_VIEW` | Class/section/subject allocation matrix |

## Academics

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET / POST | `/api/academic-years` | `ACADEMICS_MANAGE` | |
| GET / PATCH | `/api/academic-years/[id]` | `ACADEMICS_MANAGE` | `PATCH` can flip `isActive` |
| GET / POST | `/api/classes` | `ACADEMICS_MANAGE` | |
| GET / PATCH / DELETE | `/api/classes/[id]` | `ACADEMICS_MANAGE` | |
| GET / POST | `/api/sections` | `ACADEMICS_MANAGE` | |
| GET / PATCH / DELETE | `/api/sections/[id]` | `ACADEMICS_MANAGE` | |
| GET / POST | `/api/subjects` | `ACADEMICS_MANAGE` | |
| GET / PATCH / DELETE | `/api/subjects/[id]` | `ACADEMICS_MANAGE` | |
| GET | `/api/academics/classes`, `/api/academics/subjects` | `ACADEMICS_MANAGE` | Lightweight lookups for pickers |

## Attendance

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/api/attendance/students/roster` | `ATTENDANCE_VIEW` | Class+section+date roster to mark against |
| POST | `/api/attendance/students/bulk` | `ATTENDANCE_MARK` | Bulk upsert for a whole class/section/date |
| GET | `/api/attendance/students/history` | `ATTENDANCE_VIEW` | Per-student calendar history |
| GET | `/api/attendance/students/report` | `ATTENDANCE_VIEW` | Aggregate report, exportable (Excel/PDF client-side) |
| GET | `/api/attendance/teachers/roster` | `STAFF_ATTENDANCE_MARK` | |
| POST | `/api/attendance/teachers/bulk` | `STAFF_ATTENDANCE_MARK` | |
| POST | `/api/attendance/qr/session` | `ATTENDANCE_MARK` | Creates a signed, time-boxed QR check-in session |
| POST | `/api/attendance/qr/checkin` | `withAuth` (any signed-in student) | Consumes the token from `/dashboard/attendance/checkin/[token]` |

## Hostel

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET / POST | `/api/hostel/buildings` | `HOSTEL_MANAGE` | |
| GET / PATCH / DELETE | `/api/hostel/buildings/[id]` | `HOSTEL_MANAGE` | |
| GET / POST | `/api/hostel/rooms` | `HOSTEL_MANAGE` | |
| GET / PATCH / DELETE | `/api/hostel/rooms/[id]` | `HOSTEL_MANAGE` | |
| GET | `/api/hostel/allocations` | `HOSTEL_MANAGE` | **Staff-only** — full roster, not exposed to `HOSTEL_VIEW` |
| POST | `/api/hostel/allocations` | `HOSTEL_MANAGE` | Assign student to a room/bed |
| POST | `/api/hostel/allocations/[id]/vacate` | `HOSTEL_MANAGE` | |
| GET | `/api/hostel/my-allocation` | `withAuth` | Self-service: the caller's own allocation only |
| GET | `/api/hostel/attendance/roster` | `HOSTEL_MANAGE` | |
| POST | `/api/hostel/attendance/bulk` | `HOSTEL_MANAGE` | Nightly roll-call |
| GET | `/api/hostel/attendance/history` | `HOSTEL_VIEW` | |
| GET | `/api/hostel/leave-requests` | `HOSTEL_MANAGE` | **Staff-only** |
| POST | `/api/hostel/leave-requests` | `HOSTEL_VIEW` | Any parent/student can request leave for their ward |
| POST | `/api/hostel/leave-requests/[id]/review` | `HOSTEL_MANAGE` | Approve/reject |
| GET | `/api/hostel/gate-passes` | `HOSTEL_MANAGE` | **Staff-only** |
| POST | `/api/hostel/gate-passes` | `HOSTEL_MANAGE` | |
| POST | `/api/hostel/gate-passes/[id]/return` | `HOSTEL_MANAGE` | |
| GET | `/api/hostel/visitor-logs` | `HOSTEL_MANAGE` | **Staff-only** |
| POST | `/api/hostel/visitor-logs` | `HOSTEL_MANAGE` | |
| POST | `/api/hostel/visitor-logs/[id]/checkout` | `HOSTEL_MANAGE` | |

## Health

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET / POST | `/api/health/medicine-logs` | `HEALTH_MANAGE` | **Staff-only** — full log list |
| GET / POST | `/api/health/doctor-visits` | `HEALTH_MANAGE` | **Staff-only** — full log list |
| GET | `/api/health/medical-report` | `HEALTH_VIEW` | Combined medicine + doctor-visit history for one `studentId`; Students/Parents are locked to themselves/their own children, Teachers to students in their assigned class/section, senior staff have school-wide access |

## Library

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET / POST | `/api/books` | `LIBRARY_VIEW` (GET) / `LIBRARY_MANAGE` (POST) | |
| GET / PATCH / DELETE | `/api/books/[id]` | `LIBRARY_VIEW`/`LIBRARY_MANAGE` | Delete blocked while copies are on issue |
| GET | `/api/library/issues` | `LIBRARY_MANAGE` | **Staff-only** — full borrowing roster |
| POST | `/api/library/issues` | `LIBRARY_MANAGE` | Decrements `Book.availableCopies` |
| POST | `/api/library/issues/[id]/return` | `LIBRARY_MANAGE` | Computes overdue fine automatically |

## Notifications

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/api/notifications` | `NOTIFICATIONS_VIEW` | Scoped to the caller's audience |
| POST | `/api/notifications` | `NOTIFICATIONS_SEND` | |
| POST | `/api/notifications/[id]/read` | `NOTIFICATIONS_VIEW` | Marks read for the caller |

## Dashboard

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/api/dashboard` | `DASHBOARD_VIEW` | Role-aware summary cards/widgets |

## Error codes

| Status | Meaning |
|---|---|
| 400 | Bad request (business-rule violation surfaced as `ApiError.badRequest`) |
| 401 | Not signed in / session expired |
| 403 | Signed in, but missing the required permission, or CSRF/origin check failed |
| 404 | Not found |
| 409 | Conflict (duplicate key — unique index violation) |
| 422 | Zod validation failed (`details` has per-field messages) |
| 429 | Rate limit exceeded (`Retry-After` header present) |
| 500 | Unexpected server error (logged server-side, never leaks internals to the client) |
