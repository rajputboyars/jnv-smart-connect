# Database Schema

MongoDB via Mongoose. Every collection is scoped to a `School` (see
[Multi-tenancy](./ARCHITECTURE.md#multi-tenancy-current--future)) except
`School` itself. All `_id`s are `ObjectId`; all schemas use
`{ timestamps: true }` unless noted.

## Entity-relationship diagram

```mermaid
erDiagram
    School ||--o{ User : "employs / enrolls"
    School ||--o{ AcademicYear : has
    School ||--o{ Class : has
    School ||--o{ Section : has
    School ||--o{ Subject : has
    School ||--o{ Student : has
    School ||--o{ Teacher : has
    School ||--o{ Parent : has
    School ||--o{ HostelBuilding : has
    School ||--o{ Book : has

    User ||--o| Teacher : "1:1 (staff login)"
    User ||--o| Parent : "1:1 (parent login)"
    User ||--o| Student : "1:1 (optional student login)"

    AcademicYear ||--o{ Class : scopes
    Class ||--o{ Section : contains
    Class }o--o{ Subject : teaches
    Section }o--|| Class : belongs_to

    Teacher }o--o{ Subject : qualified_in
    Teacher ||--o{ Section : "class teacher of"

    Student }o--|| Class : enrolled_in
    Student }o--|| Section : enrolled_in
    Parent }o--o{ Student : "guardian of"

    Student ||--o{ Attendance : "attendance record"
    Teacher ||--o{ Attendance : "attendance record"
    AttendanceSession ||--o{ Student : "QR check-ins"

    HostelBuilding ||--o{ HostelRoom : contains
    HostelRoom ||--o{ HostelAllocation : "bed assignment"
    Student ||--o| HostelAllocation : "active allocation"
    Student ||--o{ HostelAttendance : "night roll-call"
    Student ||--o{ LeaveRequest : requests
    Student ||--o{ GatePass : issued
    Student ||--o{ VisitorLog : visited_by

    Student ||--o{ MedicineLog : "medicine given"
    Student ||--o{ DoctorVisit : "doctor visit"

    Book ||--o{ BookIssue : "copy issued"
    Student ||--o{ BookIssue : borrows

    User ||--o{ ActivityLog : performs
    User ||--o{ Notification : sends
```

## Collections

### `School`
The tenant row. `code` is globally unique. Holds `activeAcademicYear` so
every module can default to "this year" without a lookup.

### `User`
Login identity for every human in the system (staff, parents, students who
have accounts). `role` is one of the 9 values in `src/types/roles.ts`.
`password` and the verification/reset token fields are `select: false` —
never returned unless explicitly `.select("+password")`'d. `school` is
optional only for a bootstrap Super Admin created before any school exists.

### `AcademicYear`
`{ school, name }` unique. `isActive` flags the current year; `School
.activeAcademicYear` points at it.

### `Class` / `Section` / `Subject`
`Class` is scoped to a school + academic year (`numericLevel` 6–12, matching
JNV's Class VI–XII structure). `Section` belongs to a `Class` and can name a
`classTeacher`. `Subject.type` is `core | elective | co_curricular`.

### `Teacher`
1:1 with a `User` (the login). `assignedClasses` is an embedded array of
`{ class, section, subject }` triples — a teacher's full timetable
allocation without a separate join collection. `employeeId` unique per
school; full-text index on name/employeeId/email for search.

### `Parent`
1:1 with a `User`. `children` is an array of `Student` refs (a parent can
have more than one ward at the same JNV, e.g. twins).

### `Student`
The largest document: identity (`admissionNumber`, `rollNumber`,
`aadhaarNumber`), demographics (`dob`, `gender`, `bloodGroup`, JNV `house`),
embedded `address`, `guardianDetails`, `emergencyContact`, and `medicalInfo`
(read by the Health module for allergy/condition context — no separate
lookup needed when logging a medicine dose). `status` is
`active | inactive | alumni | transferred`. `user` is optional (a student
doesn't need a login to exist as a record).

### `Attendance`
Polymorphic on `entityType: "student" | "teacher"` rather than two
collections, so reporting can query across both uniformly. A partial unique
index per `entityType` enforces "one attendance record per person per day."
`method` distinguishes `manual` (staff-marked) from `qr` (self-check-in).

### `AttendanceSession`
Backs QR self-check-in: a staff member creates a session for a
class/section/subject/period, gets a signed, time-boxed token (`tokenHash`
is SHA-256 of the raw token — the raw token never touches the database), and
students hitting `/dashboard/attendance/checkin/[token]` get added to
`checkedInStudents` until `expiresAt`.

### Hostel: `HostelBuilding` → `HostelRoom` → `HostelAllocation`
A building has rooms; a room has `bedCount` beds. `HostelAllocation` is the
join between a `Student` and a specific `(room, bedNumber)`. Two partial
unique indexes enforce the real-world constraints: a student can only have
one **active** allocation, and a bed can only be **actively** occupied by one
student — vacated allocations stay in the collection as history.

### `HostelAttendance`
Nightly roll-call per student per building, `present | absent | on_leave`,
one record per student per day (unique index).

### `LeaveRequest` → `GatePass`
A `LeaveRequest` is the approval workflow (`pending → approved/rejected`); an
approved leave can be linked from a `GatePass`, which is the actual
out/in-time log at the gate (`issued | returned | overdue`). A `GatePass`
doesn't strictly require a `LeaveRequest` (day-visits, medical trips).

### `VisitorLog`
Independent of the student leaving campus — records who came to see a
student, when, and why.

### `MedicineLog` / `DoctorVisit`
Health module's two logs: routine medicine administration vs. a doctor
consultation (with `diagnosis`/`prescription`/`followUpDate`).

### `Book` / `BookIssue`
`Book.accessionNumber` is the school's physical barcode number (rendered as
a real Code128 barcode client-side via `jsbarcode`), unique per school.
`availableCopies` is decremented/incremented transactionally by the issue/
return controller functions rather than computed on read. `BookIssue.status`
is `issued | returned | lost`; overdue-ness is derived at read time from
`dueDate`, not stored.

### `Notification`
`audienceScope` picks how `audienceRoles` / `audienceClass` /
`audienceSection` / `audienceUsers` are interpreted (broadcast, role-based,
class-based, section-based, or a specific user list). `readBy` is an
embedded array of `{ user, readAt }` receipts rather than a separate
collection, since a notification's reader list is bounded and always read
alongside the notification itself.

### `ActivityLog`
Free-form audit trail: `action` is a dotted string (`auth.login`,
`auth.login_failed`, `students.create`, …), with optional `entityType` +
`entityId` for the affected record and `ipAddress`/`userAgent` for
security-relevant actions (all `auth.*` events; not threaded through every
CRUD mutation — see [Security](./ARCHITECTURE.md) for the scoping rationale).

## Indexing strategy

Every collection indexes `school` (most as the leading key of a compound
index, since virtually every query is "this school's X where …"). Uniqueness
invariants are enforced with compound or partial-filter indexes rather than
application-level checks alone (`AcademicYear` name, `Class` name per year,
`Section` name per class, `Subject`/`Book` code per school, `Teacher`
employeeId per school, the two hostel-allocation partial indexes above, one
attendance record per person per day). Full-text indexes exist on `Teacher`
(name/employeeId/email) and `Book` (title/author/category/isbn) for search
without a separate search service.
