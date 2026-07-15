import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";
import { Attendance } from "@/models/Attendance";
import { LeaveRequest } from "@/models/LeaveRequest";
import { BookIssue } from "@/models/BookIssue";
import { DoctorVisit } from "@/models/DoctorVisit";
import { MedicineLog } from "@/models/MedicineLog";
import { askClaude, type AiChatMessage } from "@/lib/ai/client";
import { computeStudentRiskScore } from "@/lib/ai/risk-scoring";
import { assertCanAccessStudent } from "@/lib/auth/student-scope";
import { ApiError } from "@/lib/utils/api-error";
import { ROLES } from "@/types/roles";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type {
  HomeworkGeneratorInput,
  QuestionPaperInput,
  ReportCardNarrativeInput,
} from "@/validators/ai.validator";

const TREND_WINDOW_DAYS = 30;

function daysAgo(days: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Gathers only real, already-recorded facts about a student — this is the
 * grounding context every generative AI call below is built on. Nothing
 * here is invented; if a fact isn't in the database, it's simply omitted
 * from what's sent to Claude, and the system prompt instructs the model not
 * to fill gaps with assumptions.
 */
async function getStudentContext(studentId: string, session: AccessTokenPayload) {
  await assertCanAccessStudent(studentId, session, "You don't have access to this student's records");

  const student = await Student.findById(studentId)
    .populate("currentClass", "name")
    .populate("section", "name")
    .lean();
  if (!student) throw ApiError.notFound("Student not found");

  const since = daysAgo(TREND_WINDOW_DAYS);
  const [attendanceAgg, recentVisits, recentMedicine, overdueBooks] = await Promise.all([
    Attendance.aggregate([
      { $match: { student: student._id, entityType: "student", date: { $gte: since } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    DoctorVisit.find({ student: student._id }).sort({ visitDate: -1 }).limit(3).select("reason visitDate").lean(),
    MedicineLog.find({ student: student._id }).sort({ givenAt: -1 }).limit(3).select("medicineName givenAt").lean(),
    BookIssue.countDocuments({ student: student._id, status: "issued", dueDate: { $lt: new Date() } }),
  ]);

  const attendanceCounts = Object.fromEntries(attendanceAgg.map((a) => [a._id, a.count]));
  const totalMarked = attendanceAgg.reduce((sum, a) => sum + a.count, 0);
  const present = attendanceCounts.present ?? 0;

  return {
    name: student.name,
    className: (student.currentClass as unknown as { name?: string } | null)?.name,
    section: (student.section as unknown as { name?: string } | null)?.name,
    attendanceLast30Days:
      totalMarked > 0 ? `${present}/${totalMarked} days present (${Math.round((present / totalMarked) * 100)}%)` : "no attendance recorded yet",
    recentDoctorVisits: recentVisits.map((v) => ({ reason: v.reason, date: v.visitDate })),
    recentMedicineGiven: recentMedicine.map((m) => ({ medicine: m.medicineName, date: m.givenAt })),
    overdueLibraryBooks: overdueBooks,
  };
}

export async function generateParentSummary(studentId: string, session: AccessTokenPayload) {
  await connectDB();
  const context = await getStudentContext(studentId, session);

  const system = [
    "You are helping a Jawahar Navodaya Vidyalaya school write a short, warm update for a parent about their child.",
    "Only use the facts given below. Do not invent grades, incidents, or details that are not present.",
    "If a section has no data, briefly say so rather than making something up.",
    `Facts about ${context.name} (Class ${context.className ?? "?"}-${context.section ?? "?"}):`,
    JSON.stringify(context, null, 2),
  ].join("\n");

  const summary = await askClaude(system, [
    {
      role: "user",
      content:
        "Write a 120-180 word update for this student's parent covering attendance and any health notes, ending with a brief, genuine encouragement. Plain paragraphs, no markdown headers.",
    },
  ]);

  return { studentId, summary };
}

export async function generateReportCardNarrative(input: ReportCardNarrativeInput, session: AccessTokenPayload) {
  await connectDB();
  const context = await getStudentContext(input.studentId, session);

  const system = [
    "You are writing a report card remark for a Jawahar Navodaya Vidyalaya student.",
    "Only use the facts given below plus the teacher's own notes. Do not invent grades or achievements.",
    `Facts about ${context.name}:`,
    JSON.stringify(context, null, 2),
    `Teacher's notes: ${input.highlights?.trim() || "(none provided)"}`,
  ].join("\n");

  const narrative = await askClaude(system, [
    {
      role: "user",
      content: "Write a constructive, specific 2-4 sentence report card remark. No preamble, just the remark text.",
    },
  ]);

  return { studentId: input.studentId, narrative };
}

export async function generateHomework(input: HomeworkGeneratorInput) {
  const system =
    "You are a Jawahar Navodaya Vidyalaya teacher's assistant creating homework. Output a numbered list of questions/tasks only — no preamble or closing remarks.";

  const homework = await askClaude(system, [
    {
      role: "user",
      content: `Create ${input.questionCount} ${input.difficulty}-difficulty homework questions for Class ${input.className} on the topic "${input.topic}" in ${input.subject}.`,
    },
  ]);

  return { homework };
}

export async function generateQuestionPaper(input: QuestionPaperInput) {
  const system =
    "You are a Jawahar Navodaya Vidyalaya teacher's assistant creating an exam question paper. Format clearly with question numbers and marks per question. Output only the paper — no preamble or commentary.";

  const paper = await askClaude(system, [
    {
      role: "user",
      content: `Create a ${input.totalMarks}-mark question paper with ${input.questionCount} questions for Class ${input.className} on ${input.subject}, topic "${input.topic}", difficulty ${input.difficulty}. Marks per question should sum to ${input.totalMarks}.`,
    },
  ]);

  return { paper };
}

const CHAT_SYSTEM_PROMPT = [
  "You are a helpful assistant for staff at a Jawahar Navodaya Vidyalaya school, inside the JNV Smart Connect ERP.",
  "You can help draft communications, explain general teaching/administrative questions, and brainstorm.",
  "You do NOT have live access to this school's database. If asked for a specific student's records, grades, or attendance, say you don't have access to live data and point them to the relevant module (Students, Attendance, Health, Library, etc.) instead of guessing or inventing data.",
].join(" ");

export async function chatWithAssistant(message: string, history: AiChatMessage[]) {
  const reply = await askClaude(CHAT_SYSTEM_PROMPT, [...history, { role: "user", content: message }]);
  return { reply };
}

export async function getStudentRiskScores(session: AccessTokenPayload) {
  await connectDB();
  if (!session.school) return [];

  const schoolId = new Types.ObjectId(session.school);
  const studentFilter: Record<string, unknown> = { school: schoolId, status: "active" };

  if (session.role === ROLES.TEACHER) {
    const teacher = await Teacher.findOne({ user: session.sub }).select("assignedClasses").lean();
    const sectionIds = [...new Set((teacher?.assignedClasses ?? []).map((a) => a.section.toString()))];
    if (sectionIds.length === 0) return [];
    studentFilter.section = { $in: sectionIds.map((id) => new Types.ObjectId(id)) };
  }

  const students = await Student.find(studentFilter)
    .select("_id name admissionNumber currentClass section")
    .populate("currentClass", "name")
    .populate("section", "name")
    .lean();
  if (students.length === 0) return [];

  const studentIds = students.map((s) => s._id);
  const since = daysAgo(TREND_WINDOW_DAYS);

  const [attendanceAgg, leaveAgg, bookAgg, visitAgg] = await Promise.all([
    Attendance.aggregate([
      { $match: { school: schoolId, entityType: "student", student: { $in: studentIds }, date: { $gte: since } } },
      { $group: { _id: { student: "$student", status: "$status" }, count: { $sum: 1 } } },
    ]),
    LeaveRequest.aggregate([
      { $match: { school: schoolId, student: { $in: studentIds }, createdAt: { $gte: since } } },
      { $group: { _id: "$student", count: { $sum: 1 } } },
    ]),
    BookIssue.aggregate([
      { $match: { school: schoolId, student: { $in: studentIds }, status: "issued" } },
      {
        $group: {
          _id: "$student",
          total: { $sum: 1 },
          overdue: { $sum: { $cond: [{ $lt: ["$dueDate", new Date()] }, 1, 0] } },
        },
      },
    ]),
    DoctorVisit.aggregate([
      { $match: { school: schoolId, student: { $in: studentIds }, visitDate: { $gte: since } } },
      { $group: { _id: "$student", count: { $sum: 1 } } },
    ]),
  ]);

  const attendanceByStudent = new Map<string, { present: number; total: number }>();
  for (const row of attendanceAgg) {
    const sid = row._id.student.toString();
    const bucket = attendanceByStudent.get(sid) ?? { present: 0, total: 0 };
    bucket.total += row.count;
    if (row._id.status === "present") bucket.present += row.count;
    attendanceByStudent.set(sid, bucket);
  }
  const leaveByStudent = new Map(leaveAgg.map((r) => [r._id.toString(), r.count as number]));
  const bookByStudent = new Map(
    bookAgg.map((r) => [r._id.toString(), { total: r.total as number, overdue: r.overdue as number }])
  );
  const visitByStudent = new Map(visitAgg.map((r) => [r._id.toString(), r.count as number]));

  const results = students.map((s) => {
    const sid = s._id.toString();
    const attendance = attendanceByStudent.get(sid);
    // No attendance records yet (e.g. a brand-new admission) shouldn't be
    // treated as "0% attendance" — that would flag every new student as
    // high risk on day one. Assume full attendance until data exists.
    const attendanceRate = attendance && attendance.total > 0 ? attendance.present / attendance.total : 1;
    const books = bookByStudent.get(sid);
    const libraryOverdueRate = books && books.total > 0 ? books.overdue / books.total : 0;

    const risk = computeStudentRiskScore({
      attendanceRate,
      hostelLeaveFrequency: leaveByStudent.get(sid) ?? 0,
      libraryOverdueRate,
      healthVisitFrequency: visitByStudent.get(sid) ?? 0,
    });

    return {
      studentId: sid,
      name: s.name,
      admissionNumber: s.admissionNumber,
      className: (s.currentClass as unknown as { name?: string } | null)?.name,
      section: (s.section as unknown as { name?: string } | null)?.name,
      ...risk,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
