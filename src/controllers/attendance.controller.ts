import crypto from "crypto";
import { Types, type AnyBulkWriteOperation } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Attendance, type IAttendance } from "@/models/Attendance";
import { AttendanceSession } from "@/models/AttendanceSession";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";
import { ApiError } from "@/lib/utils/api-error";
import type {
  BulkStudentAttendanceInput,
  BulkTeacherAttendanceInput,
} from "@/validators/attendance.validator";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

function normalizeDate(date: string | Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function resolveActiveAcademicYear(school: string) {
  const { School } = await import("@/models/School");
  const { AcademicYear } = await import("@/models/AcademicYear");

  const schoolDoc = await School.findById(school).select("activeAcademicYear");
  if (schoolDoc?.activeAcademicYear) return schoolDoc.activeAcademicYear;

  const latest = await AcademicYear.findOne({ school }).sort({ startDate: -1 });
  if (!latest) throw ApiError.badRequest("No academic year configured for your school yet");
  return latest._id;
}

export async function getClassRosterForAttendance(
  classId: string,
  sectionId: string,
  date: string,
  school?: string
) {
  await connectDB();

  const students = await Student.find({
    currentClass: classId,
    section: sectionId,
    status: "active",
    ...(school ? { school } : {}),
  })
    .select("name admissionNumber rollNumber photoUrl")
    .sort({ rollNumber: 1, name: 1 })
    .lean();

  const day = normalizeDate(date);
  const existing = await Attendance.find({
    entityType: "student",
    class: classId,
    section: sectionId,
    date: day,
  }).lean();

  const existingMap = new Map(existing.map((a) => [a.student?.toString(), a]));

  return students.map((s) => ({
    student: {
      id: s._id.toString(),
      name: s.name,
      admissionNumber: s.admissionNumber,
      rollNumber: s.rollNumber,
      photoUrl: s.photoUrl,
    },
    status: existingMap.get(s._id.toString())?.status ?? "present",
    remarks: existingMap.get(s._id.toString())?.remarks ?? "",
  }));
}

export async function bulkMarkStudentAttendance(
  input: BulkStudentAttendanceInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  // Bulk upsert takes a client-submitted list of student ids — verify every
  // one actually belongs to this school and the class/section being marked
  // in a single query, rather than trusting the payload (which would
  // otherwise let a caller write attendance records referencing another
  // school's students, or a class/section a student isn't even enrolled in).
  const studentIds = input.records.map((r) => r.student);
  const validCount = await Student.countDocuments({
    _id: { $in: studentIds },
    school: actor.school,
    currentClass: input.class,
    section: input.section,
  });
  if (validCount !== new Set(studentIds.map(String)).size) {
    throw ApiError.badRequest("One or more students don't belong to this class/section");
  }

  const academicYear = await resolveActiveAcademicYear(actor.school);
  const day = normalizeDate(input.date);

  const ops = input.records.map((record) => ({
    updateOne: {
      filter: { entityType: "student", student: record.student, date: day },
      update: {
        $set: {
          school: actor.school,
          academicYear,
          class: input.class,
          section: input.section,
          status: record.status,
          remarks: record.remarks || undefined,
          markedBy: actor.id,
          method: "manual",
        },
        $setOnInsert: { entityType: "student", student: record.student, date: day },
      },
      upsert: true,
    },
  })) as unknown as AnyBulkWriteOperation<IAttendance>[];

  await Attendance.bulkWrite(ops);

  return { marked: input.records.length };
}

export async function bulkMarkTeacherAttendance(
  input: BulkTeacherAttendanceInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  // Same cross-tenant guard as bulkMarkStudentAttendance, scoped to teachers.
  const teacherIds = input.records.map((r) => r.teacher);
  const validTeacherCount = await Teacher.countDocuments({
    _id: { $in: teacherIds },
    school: actor.school,
  });
  if (validTeacherCount !== new Set(teacherIds.map(String)).size) {
    throw ApiError.badRequest("One or more teachers don't belong to this school");
  }

  const academicYear = await resolveActiveAcademicYear(actor.school);
  const day = normalizeDate(input.date);

  const ops = input.records.map((record) => ({
    updateOne: {
      filter: { entityType: "teacher", teacher: record.teacher, date: day },
      update: {
        $set: {
          school: actor.school,
          academicYear,
          status: record.status,
          remarks: record.remarks || undefined,
          markedBy: actor.id,
          method: "manual",
        },
        $setOnInsert: { entityType: "teacher", teacher: record.teacher, date: day },
      },
      upsert: true,
    },
  })) as unknown as AnyBulkWriteOperation<IAttendance>[];

  await Attendance.bulkWrite(ops);

  return { marked: input.records.length };
}

export async function getTeacherRosterForAttendance(date: string, school?: string) {
  await connectDB();
  if (!school) return [];

  const teachers = await Teacher.find({ school, status: "active" })
    .select("name employeeId photoUrl")
    .sort({ name: 1 })
    .lean();

  const day = normalizeDate(date);
  const existing = await Attendance.find({ entityType: "teacher", school, date: day }).lean();
  const existingMap = new Map(existing.map((a) => [a.teacher?.toString(), a]));

  return teachers.map((t) => ({
    teacher: { id: t._id.toString(), name: t.name, employeeId: t.employeeId, photoUrl: t.photoUrl },
    status: existingMap.get(t._id.toString())?.status ?? "present",
    remarks: existingMap.get(t._id.toString())?.remarks ?? "",
  }));
}

export async function getStudentAttendanceHistory(
  studentId: string,
  from: string,
  to: string,
  school?: string
) {
  await connectDB();

  const records = await Attendance.find({
    entityType: "student",
    student: studentId,
    ...(school ? { school } : {}),
    date: { $gte: normalizeDate(from), $lte: normalizeDate(to) },
  })
    .sort({ date: 1 })
    .lean();

  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    leave: 0,
    total: records.length,
  };
  for (const r of records) {
    summary[r.status] += 1;
  }

  const percentage =
    summary.total > 0 ? Math.round(((summary.present + summary.half_day * 0.5) / summary.total) * 100) : 0;

  return {
    records: records.map((r) => ({
      date: r.date,
      status: r.status,
      remarks: r.remarks,
    })),
    summary,
    percentage,
  };
}

export async function getClassAttendanceReport(
  classId: string,
  sectionId: string,
  from: string,
  to: string,
  school?: string
) {
  await connectDB();

  const students = await Student.find({
    currentClass: classId,
    section: sectionId,
    status: "active",
    ...(school ? { school } : {}),
  })
    .select("name admissionNumber rollNumber")
    .sort({ rollNumber: 1, name: 1 })
    .lean();

  const records = await Attendance.find({
    entityType: "student",
    class: classId,
    section: sectionId,
    date: { $gte: normalizeDate(from), $lte: normalizeDate(to) },
  }).lean();

  const byStudent = new Map<string, typeof records>();
  for (const r of records) {
    const key = r.student!.toString();
    if (!byStudent.has(key)) byStudent.set(key, []);
    byStudent.get(key)!.push(r);
  }

  return students.map((s) => {
    const studentRecords = byStudent.get(s._id.toString()) ?? [];
    const total = studentRecords.length;
    const present = studentRecords.filter((r) => r.status === "present").length;
    const absent = studentRecords.filter((r) => r.status === "absent").length;
    const late = studentRecords.filter((r) => r.status === "late").length;
    const halfDay = studentRecords.filter((r) => r.status === "half_day").length;
    const leave = studentRecords.filter((r) => r.status === "leave").length;
    const percentage = total > 0 ? Math.round(((present + halfDay * 0.5) / total) * 100) : 0;

    return {
      student: {
        id: s._id.toString(),
        name: s.name,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
      },
      total,
      present,
      absent,
      late,
      halfDay,
      leave,
      percentage,
    };
  });
}

// --- QR attendance ---

const QR_TOKEN_BYTES = 24;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createQrAttendanceSession(
  input: { class: string; section: string; subject?: string; date: string; period?: number; expiresInMinutes: number },
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const academicYear = await resolveActiveAcademicYear(actor.school);
  const rawToken = crypto.randomBytes(QR_TOKEN_BYTES).toString("hex");

  const session = await AttendanceSession.create({
    school: actor.school,
    academicYear,
    class: input.class,
    section: input.section,
    subject: input.subject || undefined,
    date: normalizeDate(input.date),
    period: input.period,
    createdBy: actor.id,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + input.expiresInMinutes * 60 * 1000),
    checkedInStudents: [],
  });

  return { sessionId: session._id.toString(), token: rawToken, expiresAt: session.expiresAt };
}

export async function checkInWithQrToken(rawToken: string, session: AccessTokenPayload) {
  await connectDB();

  const tokenHash = hashToken(rawToken);
  const attendanceSession = await AttendanceSession.findOne({ tokenHash });

  if (!attendanceSession) {
    throw ApiError.notFound("This attendance code is invalid");
  }
  if (attendanceSession.expiresAt < new Date()) {
    throw ApiError.badRequest("This attendance code has expired");
  }

  const student = await Student.findOne({ user: session.sub });
  if (!student) {
    throw ApiError.forbidden("Only students can check in with this code");
  }
  if (
    student.currentClass.toString() !== attendanceSession.class.toString() ||
    student.section.toString() !== attendanceSession.section.toString()
  ) {
    throw ApiError.forbidden("This attendance code isn't for your class");
  }

  const day = normalizeDate(attendanceSession.date);

  await Attendance.updateOne(
    { entityType: "student", student: student._id, date: day },
    {
      $set: {
        school: attendanceSession.school,
        academicYear: attendanceSession.academicYear,
        class: attendanceSession.class,
        section: attendanceSession.section,
        status: "present",
        markedBy: session.sub,
        method: "qr",
      },
      $setOnInsert: { entityType: "student", student: student._id, date: day },
    },
    { upsert: true }
  );

  if (!attendanceSession.checkedInStudents.some((id) => id.toString() === student._id.toString())) {
    attendanceSession.checkedInStudents.push(new Types.ObjectId(student._id));
    await attendanceSession.save();
  }

  return { message: "You're marked present. Have a great class!" };
}
