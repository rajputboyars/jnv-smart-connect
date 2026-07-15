# Folder Structure

```
jnv-smart-connect/
├── docs/                        # This documentation suite
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   ├── FOLDER_STRUCTURE.md
│   └── ROADMAP.md
├── scripts/
│   └── seed.ts                  # Seeds a School, AcademicYear, Classes/Sections,
│                                 # core Subjects, and a Super Admin login
├── src/
│   ├── proxy.ts                 # Next.js 16 Proxy: rate limiting, CSRF/origin
│   │                             # checks, security headers, page auth/RBAC
│   │
│   ├── app/
│   │   ├── (auth)/              # Public route group: /login, /forgot-password,
│   │   │                        # /reset-password/[token]
│   │   ├── dashboard/           # Every authenticated page, one folder per
│   │   │   ├── students/        # module (students, teachers, academics,
│   │   │   ├── teachers/        # attendance, hostel, health, library,
│   │   │   ├── academics/       # notifications, activity-logs, profile,
│   │   │   ├── attendance/      # settings, accounts/exams/homework — the
│   │   │   ├── hostel/          # last three are "coming soon" placeholders,
│   │   │   ├── health/          # see ROADMAP.md)
│   │   │   ├── library/         #
│   │   │   ├── notifications/   # Each page.tsx is a Server Component that
│   │   │   ├── activity-logs/   # calls requirePermission() before rendering
│   │   │   ├── profile/         # a client component.
│   │   │   └── settings/
│   │   ├── unauthorized/        # Shown when RBAC denies a route
│   │   └── api/                 # Route Handlers — one folder per resource,
│   │                            # mirroring the dashboard modules above
│   │                            # (see docs/API.md for the full endpoint list)
│   │
│   ├── components/
│   │   ├── ui/                  # Design-system primitives (button, input,
│   │   │                        # dialog, table, form, …) — hand-built over
│   │   │                        # Radix UI, shadcn-style
│   │   ├── layout/               # App shell: sidebar, navbar, nav-config.ts
│   │   │                        # (role -> visible nav items)
│   │   └── <feature>/            # students/, teachers/, academics/,
│   │                             # attendance/, hostel/, health/, library/,
│   │                             # notifications/, profile/, dashboard/,
│   │                             # auth/, shared/ (StudentPicker, Pagination,
│   │                             # ConfirmDialog, etc. reused across modules)
│   │
│   ├── controllers/              # One file per domain — the only layer that
│   │                              # imports Mongoose models directly
│   ├── models/                   # Mongoose schemas + the shared enums.ts
│   ├── validators/                # Zod schemas, imported by both API routes
│   │                              # and client-side React Hook Form
│   ├── middlewares/               # withAuth / withPermission / withErrorHandling
│   │
│   ├── lib/
│   │   ├── auth/                 # jwt.ts, password.ts, session.ts (cookies),
│   │   │                         # rbac.ts (permission matrix), dal.ts
│   │   │                         # (requireSession/requirePermission)
│   │   ├── security/              # rate-limit.ts, csrf.ts
│   │   ├── db/                    # connect.ts (cached Mongoose connection)
│   │   ├── email/                 # mailer.ts (graceful no-op if SMTP unset),
│   │   │                          # templates.ts
│   │   ├── export/                # Excel/PDF export helpers (exceljs,
│   │   │                          # jspdf/jspdf-autotable)
│   │   ├── utils/                 # api-error.ts, api-response.ts, utils.ts
│   │   └── api-client.ts          # Client-side fetch wrapper: JSON envelope
│   │                               # unwrapping + the silent-refresh interceptor
│   │
│   ├── services/                  # Client-side, one per domain — thin
│   │                               # wrappers over apiFetch() returning typed
│   │                               # data for hooks to consume
│   ├── hooks/                     # TanStack Query hooks (use-students.ts,
│   │                               # use-library.ts, …) + use-auth.ts
│   ├── providers/                 # QueryClientProvider, ThemeProvider, Toaster
│   ├── context/                   # AuthContext (current user + role)
│   └── types/                     # roles.ts and other shared types
│
├── next.config.ts                 # Security headers (CSP/HSTS in prod), etc.
├── .env.example                   # Every environment variable this app reads
└── package.json
```

## Naming conventions

- **Routes**: `src/app/api/<resource>/route.ts` for the collection,
  `src/app/api/<resource>/[id]/route.ts` for a single item, and
  `src/app/api/<resource>/[id]/<action>/route.ts` for a sub-action that isn't
  plain CRUD (e.g. `.../allocations/[id]/vacate`, `.../gate-passes/[id]/return`).
- **Controllers**: `src/controllers/<domain>.controller.ts`, one exported
  function per operation, named as a verb phrase (`listStudents`,
  `createStudent`, `vacateAllocation`, …).
- **Validators**: `src/validators/<domain>.validator.ts`, exporting both the
  Zod schema (`createStudentSchema`) and its inferred type
  (`CreateStudentInput`) so the same type flows into React Hook Form.
- **Hooks**: `src/hooks/use-<domain>.ts`, exporting one hook per query/mutation
  (`useStudents`, `useCreateStudent`, `useUpdateStudent`, `useDeleteStudent`).
