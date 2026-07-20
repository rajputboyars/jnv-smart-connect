# QA Bug Report — JNV Smart Connect

**Audit date:** 2026-07-20
**Scope:** Full application — RBAC/multi-tenancy, Finance, Inventory, HR, Maintenance,
Events, Students/Teachers, and the shared app shell (navbar/sidebar/forms).
**Method:** Static code audit of controllers, route handlers, validators, hooks and
UI components, tracing each user-facing flow end-to-end. Build, typecheck, lint and
the unit test suite are all green — these are **logic / UX defects that pass
compilation**, not build breakages.

---

## Severity summary

| ID | Severity | Area | Title |
|----|----------|------|-------|
| BUG-01 | 🔴 High | Finance | "Mark processed" on a refund always fails; two-step refund workflow is broken |
| BUG-02 | 🟠 Medium | Finance | Percentage scholarship value is not capped at 100% |
| BUG-03 | 🟠 Medium | HR | Self-service HR tabs error out for staff roles with no employee record |
| BUG-04 | 🟠 Medium | Students/Teachers | Deleting a teacher/student orphans the linked login and related records |
| BUG-05 | 🟡 Low | Events | Participant/photo/certificate writes don't verify the event's school |
| BUG-06 | 🟡 Low | Inventory | Low-stock notifications are sent on every transaction (spam) |
| BUG-07 | 🟡 Low | Finance | A refund "approved" already removes the money in-system |
| BUG-08 | 🟠 Medium | UI / Shell | Global "Search students" bar is shown to Parents/Students who can't view students |
| BUG-09 | 🟡 Low | Events | Certificate PDF hard-codes the school name |
| BUG-10 | 🟡 Low | UI / Students | Re-searching from the navbar doesn't update the Students table |
| BUG-11 | 🟡 Low | UI | Search inputs fire one request per keystroke (no debounce) |
| BUG-12 | 🟡 Low | Maintenance | "Assign technician" only lists exact specialization matches |

Severity key: 🔴 **High** = broken feature / data corruption; 🟠 **Medium** =
significant UX breakage or a latent data-integrity risk; 🟡 **Low** = polish,
spam, or edge case.

---

## Functionality bugs

### BUG-01 🔴 High — Refund "Mark processed" always fails; two-step refund workflow is broken
**Location:** `src/controllers/fee-invoice.controller.ts` → `reviewRefund` (line ~388);
UI `src/components/finance/refunds-panel.tsx` (line ~104).

**What happens:** The Refunds UI implements a three-state flow: `pending → approved →
processed`. When a refund is `pending`, staff can Approve/Reject; when it is `approved`,
staff see a **"Mark processed"** button. But `reviewRefund` starts with:

```ts
if (refund.status !== "pending") throw ApiError.conflict("This refund has already been reviewed");
```

So clicking **"Mark processed"** on an already-approved refund **always throws
"This refund has already been reviewed."** The processed state is unreachable, and
`processedAt` is never set.

**Compounding risk:** Both the `approved` and `processed` branches decrement
`invoice.paidAmount`. If the guard were simply relaxed to allow the second step, the
refund would be deducted from the invoice **twice** (double refund). The guard is
currently masking a latent double-deduction bug.

**Repro:** Finance → Refunds → Approve a pending refund → click **Mark processed** →
error toast, refund stuck in `approved` forever.

**Expected:** An `approved` refund can be moved to `processed` (setting `processedAt`)
**without** re-deducting from the invoice.

---

### BUG-02 🟠 Medium — Percentage scholarship value is not capped at 100%
**Location:** `src/validators/finance.validator.ts` → `createScholarshipSchema.value`
(`z.number().min(0)`, no max); consumed in
`src/controllers/fee-invoice.controller.ts` (line ~99).

**What happens:** A `percentage`-type scholarship accepts any non-negative value,
including `> 100` (e.g. `150`). During invoice generation:

```ts
totalDiscount = Math.round(((structure.amount * scholarship.value) / 100) * 100) / 100
```

With `value = 150` on a ₹10,000 fee this yields a ₹15,000 discount, making
`netPayable` **negative**. Those invoices auto-mark as `paid`, and the negative
balances flow into the ledger / receivable / annual reports, corrupting totals.
(The `fixed` type is already clamped via `Math.min(value, amount)`; only the
percentage path is unguarded.)

**Expected:** For `type === "percentage"`, cap `value` at `100` at the validator
level (a Zod `superRefine` on the pair).

---

### BUG-03 🟠 Medium — Self-service HR tabs error out for staff roles with no employee record
**Location:** `src/lib/auth/teacher-scope.ts` → `resolveOwnTeacherId`; used by
`staff-leave.controller.ts`, `payroll.controller.ts`, `employee-record.controller.ts`.
Roles granted `HR_VIEW` without being teachers: `VICE_PRINCIPAL`, `HOSTEL_WARDEN`,
`LIBRARIAN` (see `src/lib/auth/rbac.ts` lines ~136, ~172, ~195).

**What happens:** These roles can open **HR** (the route allows `HR_VIEW`), but the
HR "employee" is modelled only as a `Teacher` document. Their user account has no
linked `Teacher`, so `resolveOwnTeacherId` throws:

> "No employee record is linked to your account"

on the **Leave**, **Payslips**, and **My Employee File** tabs. The whole self-service
experience is a red error toast for those three roles.

**Expected:** Either don't grant `HR_VIEW` to non-employee roles, or have the
self-service endpoints degrade to a friendly empty state ("No employee record")
instead of throwing.

---

### BUG-04 🟠 Medium — Deleting a teacher/student orphans the linked login and related records
**Location:** `src/controllers/teacher.controller.ts` → `deleteTeacher` (line ~140,
`findOneAndDelete`); `src/controllers/student.controller.ts` → `deleteStudent`
(line ~141).

**What happens:** Delete hard-removes only the `Teacher`/`Student` document. It does
**not** touch:
- the linked **`User` login** — the account can still sign in, now with no profile,
  which then triggers "no record" errors across the app;
- dependent records — for a teacher: `StaffLeaveRequest`, `SalaryStructure`,
  `Payslip`, `EmployeeDocument`, `PerformanceReview`, `PromotionHistory`; for both:
  fee invoices/payments, attendance, etc. — all left dangling and referencing a
  non-existent parent.

**Expected:** Cascade-clean dependents (or soft-delete / deactivate), and at minimum
disable or remove the orphaned `User` account.

---

### BUG-05 🟡 Low — Event participant/photo/certificate writes don't verify the event's school
**Location:** `src/controllers/event-participant.controller.ts` (line ~29),
`src/controllers/event-photo.controller.ts` (line ~20).

**What happens:** `addEventParticipant` validates the **student** is in the caller's
school (`assertStudentInSchool`) but never checks that `input.event` belongs to the
caller's school; `addEventPhoto` checks neither. The new record is stamped with
`actor.school`, so a manager who passes another school's `eventId` creates an
orphan record attached to a foreign event. Reads are school-scoped, so there's no
direct cross-tenant read leak, but it pollutes data and lets one tenant write
against another tenant's event id.

**Expected:** Assert the parent `Event` exists in `actor.school` before creating the
child record (mirrors the `assertStudentInSchool` pattern).

---

### BUG-06 🟡 Low — Low-stock notifications are sent on every transaction (spam)
**Location:** `src/controllers/stock.controller.ts` → `recordStockTransaction`
(line ~109).

**What happens:** A notification to Super Admin + Principal fires on **every**
transaction where `quantityInStock <= reorderLevel` — including a `purchase` that is
still below the threshold and every subsequent `issue` while the item stays low. An
item that lingers below reorder level generates a fresh alert on each movement.

**Expected:** Notify only on the **transition** into low stock (was above the reorder
level before this transaction, at/below it after).

---

### BUG-07 🟡 Low — A refund "approved" already removes the money in-system
**Location:** `src/controllers/fee-invoice.controller.ts` → `reviewRefund` (line ~395).

**What happens:** The invoice's `paidAmount` is decremented when the status becomes
**`approved`**, not only `processed`. So the outstanding balance already reflects a
refund that hasn't actually been disbursed. Combined with BUG-01, the
`approved` vs `processed` distinction carries no real meaning. Decide which state
represents "money actually returned" and only adjust the invoice there.

---

## UI / UX bugs

### BUG-08 🟠 Medium — Global "Search students" bar is shown to Parents/Students who can't view students
**Location:** `src/components/layout/navbar.tsx` (lines ~38–43 & ~57).

**What happens:** The navbar search form is `hidden … sm:flex`, i.e. rendered for
**every** role on ≥sm screens. `handleSearch` always routes to
`/dashboard/students?search=…`. Parents and Students do **not** hold `STUDENTS_VIEW`,
so submitting the search sends them straight to **`/unauthorized`**.

**Repro:** Log in as a Parent on a tablet/desktop → type in the top search → Enter →
"Unauthorized" page.

**Expected:** Only render the global student search for roles that hold
`STUDENTS_VIEW` (or hide/redirect appropriately per role).

---

### BUG-09 🟡 Low — Certificate PDF hard-codes the school name
**Location:** `src/components/events/event-detail-dialog.tsx` (line ~220).

**What happens:** Generated event certificates always print
`schoolName: "JNV Smart Connect"` regardless of the actual tenant. Notably the fee
**receipt** PDF (`invoice-detail-dialog.tsx`) correctly uses the real school name
(`data.school?.name ?? …`), so this is an internal inconsistency, not a platform
limit. In a multi-tenant deployment every school's certificates would carry the
wrong name.

**Expected:** Pass the real school name into `exportCertificatePdf` (fetch it, or
include it in the certificates API payload).

---

### BUG-10 🟡 Low — Re-searching from the navbar doesn't update the Students table
**Location:** `src/components/students/student-table.tsx` (line ~39).

**What happens:** The table's `search` state is seeded from the URL **once**
(`useState(searchParams.get("search") ?? "")`). If the user is already on the
Students page and searches again from the navbar (`router.push` to the same route
with a new `?search=`), the URL changes but the local state — and therefore the
input box and results — do not.

**Expected:** Sync the search state to the `searchParams` value (e.g. `useEffect`
on the param, or drive the query directly from the URL).

---

### BUG-11 🟡 Low — Search inputs fire one request per keystroke (no debounce)
**Location:** `src/components/students/student-table.tsx` (lines ~69–72); similar
pattern in other list panels.

**What happens:** `onChange` updates `search` on every keystroke and the query key
includes `search`, so typing "sharma" issues six network requests. Functionally OK
thanks to `placeholderData`, but wasteful and can flicker under load.

**Expected:** Debounce the search term (~300 ms) before it enters the query key.

---

### BUG-12 🟡 Low — "Assign technician" only lists exact specialization matches
**Location:** `src/components/maintenance/tickets-panel.tsx` → `AssignDialog`
(`useTechnicians(ticket.category)`).

**What happens:** The assign dropdown is filtered to technicians whose
`specialization` exactly equals the ticket's `category`. If no technician matches
that category (common for `other`, `water`, `internet`), the dropdown is empty and
the ticket **cannot be assigned to anyone**.

**Expected:** Default to matching technicians but allow choosing any active
technician (e.g. a "show all" toggle), so no ticket is un-assignable.

---

## Notes & non-issues verified during the audit

These were checked and found **correct** (documented so they aren't re-investigated):

- **Multi-tenant reads** across Finance/Inventory/HR/Maintenance/Events are
  consistently `school`-scoped; cross-tenant reads return empty rather than leaking.
- **Fee-receipt PDF** correctly uses the real school name and per-payment data.
- **Invoice payment** guards against overpayment (`balance + 0.01`) and rounds to
  paise; the only gap is the standard read-modify-write race under true concurrency
  (acceptable at this scale, worth a note for a future DB-transaction pass).
- **RBAC route guard** (`proxy.ts` + `requireAnyPermission`) and the paired
  `_VIEW`/`_MANAGE` model are internally consistent; nav items and route prefixes
  line up.
- **Password change** validates current password and confirm-match server-side.
- **Table `colSpan`** counts match their headers in the audited panels (Inventory
  requests, HR leave, Maintenance tickets, Events).

## Suggested fix order

1. **BUG-01** (refund workflow) — user-visible broken feature + latent double-deduction.
2. **BUG-08** (search dead-ends for parents/students) — hits every parent/student.
3. **BUG-02** (scholarship > 100%) — one-line validator fix, prevents corrupt finance totals.
4. **BUG-03** (HR self-service errors) — decide policy, then fix roles or empty state.
5. **BUG-04** (delete cascades) — data-integrity hardening.
6. Remaining low-severity items (BUG-05/06/07/09/10/11/12) as polish.
