import { connectDB } from "@/lib/db/connect";
import { Student } from "@/models/Student";
import { Teacher } from "@/models/Teacher";
import { Parent } from "@/models/Parent";
import { Class } from "@/models/Class";
import { Notification } from "@/models/Notification";
import { ActivityLog } from "@/models/ActivityLog";
import { ROLES, type Role } from "@/types/roles";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { ApiError } from "@/lib/utils/api-error";

async function recentNotices(school?: string, limit = 5) {
  if (!school) return [];
  const notices = await Notification.find({ school })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "name role")
    .lean();

  return notices.map((n) => ({
    id: n._id.toString(),
    title: n.title,
    type: n.type,
    createdAt: n.createdAt,
    sender: n.sender,
  }));
}

async function getStaffOverview(school?: string) {
  if (!school) {
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      genderSplit: [],
      classStrength: [],
      recentActivity: [] as unknown[],
      recentNotices: [] as Awaited<ReturnType<typeof recentNotices>>,
    };
  }

  const [totalStudents, totalTeachers, totalClasses, genderAgg, classAgg, recentActivity, notices] =
    await Promise.all([
      Student.countDocuments({ school, status: "active" }),
      Teacher.countDocuments({ school, status: "active" }),
      Class.countDocuments({ school }),
      Student.aggregate([
        { $match: { school: school, status: "active" } },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]),
      Student.aggregate([
        { $match: { school: school, status: "active" } },
        {
          $lookup: {
            from: "classes",
            localField: "currentClass",
            foreignField: "_id",
            as: "class",
          },
        },
        { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
        { $group: { _id: "$class.name", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      ActivityLog.find({ school })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("user", "name role")
        .lean(),
      recentNotices(school),
    ]);

  return {
    totalStudents,
    totalTeachers,
    totalClasses,
    genderSplit: genderAgg.map((g) => ({ name: g._id ?? "Unspecified", value: g.count })),
    classStrength: classAgg
      .filter((c) => c._id)
      .map((c) => ({ name: c._id as string, value: c.count })),
    recentActivity: recentActivity.map((a) => ({
      id: a._id.toString(),
      action: a.action,
      user: a.user,
      createdAt: a.createdAt,
    })),
    recentNotices: notices,
  };
}

export async function getPrincipalDashboard(session: AccessTokenPayload) {
  await connectDB();
  const overview = await getStaffOverview(session.school);
  return { role: session.role, ...overview };
}

export async function getStaffDashboard(session: AccessTokenPayload) {
  await connectDB();
  const overview = await getStaffOverview(session.school);
  return { role: session.role, ...overview };
}

export async function getTeacherDashboard(session: AccessTokenPayload) {
  await connectDB();

  const teacher = await Teacher.findOne({ user: session.sub })
    .populate("subjects", "name code")
    .populate("assignedClasses.class", "name")
    .populate("assignedClasses.section", "name")
    .populate("assignedClasses.subject", "name")
    .lean();

  const notices = await recentNotices(session.school);

  if (!teacher) {
    return {
      role: session.role,
      profileLinked: false,
      assignedClasses: [],
      subjects: [],
      studentCount: 0,
      recentNotices: notices,
    };
  }

  const sectionIds = teacher.assignedClasses.map((a) => a.section);
  const studentCount = sectionIds.length
    ? await Student.countDocuments({ section: { $in: sectionIds }, status: "active" })
    : 0;

  return {
    role: session.role,
    profileLinked: true,
    employeeId: teacher.employeeId,
    subjects: teacher.subjects,
    assignedClasses: teacher.assignedClasses,
    studentCount,
    recentNotices: notices,
  };
}

export async function getParentDashboard(session: AccessTokenPayload) {
  await connectDB();

  const parent = await Parent.findOne({ user: session.sub })
    .populate({
      path: "children",
      populate: [
        { path: "currentClass", select: "name" },
        { path: "section", select: "name" },
      ],
    })
    .lean();

  const notices = await recentNotices(session.school);

  if (!parent) {
    return { role: session.role, profileLinked: false, children: [], recentNotices: notices };
  }

  return {
    role: session.role,
    profileLinked: true,
    children: parent.children,
    recentNotices: notices,
  };
}

export async function getStudentDashboard(session: AccessTokenPayload) {
  await connectDB();

  const student = await Student.findOne({ user: session.sub })
    .populate("currentClass", "name")
    .populate("section", "name")
    .lean();

  const notices = await recentNotices(session.school);

  if (!student) {
    return { role: session.role, profileLinked: false, recentNotices: notices };
  }

  return {
    role: session.role,
    profileLinked: true,
    admissionNumber: student.admissionNumber,
    rollNumber: student.rollNumber,
    currentClass: student.currentClass,
    section: student.section,
    house: student.house,
    recentNotices: notices,
  };
}

export async function getDashboardForSession(session: AccessTokenPayload) {
  switch (session.role) {
    case ROLES.SUPER_ADMIN:
    case ROLES.PRINCIPAL:
      return getPrincipalDashboard(session);
    case ROLES.VICE_PRINCIPAL:
    case ROLES.HOSTEL_WARDEN:
    case ROLES.ACCOUNTANT:
    case ROLES.LIBRARIAN:
      return getStaffDashboard(session);
    case ROLES.TEACHER:
      return getTeacherDashboard(session);
    case ROLES.PARENT:
      return getParentDashboard(session);
    case ROLES.STUDENT:
      return getStudentDashboard(session);
    default: {
      const _exhaustive: never = session.role;
      throw ApiError.badRequest(`Unsupported role: ${_exhaustive}`);
    }
  }
}

export type { Role };
