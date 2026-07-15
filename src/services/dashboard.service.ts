import { apiFetch } from "@/lib/api-client";
import type { Role } from "@/types/roles";

export interface NoticeItem {
  id: string;
  title: string;
  type: "info" | "success" | "warning" | "urgent";
  createdAt: string;
  sender: { name: string; role: string } | null;
}

export interface ChartPoint {
  name: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  user: { name: string; role: string } | null;
  createdAt: string;
}

export interface StaffDashboard {
  role: Role;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  genderSplit: ChartPoint[];
  classStrength: ChartPoint[];
  recentActivity: ActivityItem[];
  recentNotices: NoticeItem[];
}

export interface TeacherDashboard {
  role: Role;
  profileLinked: boolean;
  employeeId?: string;
  subjects: { name: string; code: string }[];
  assignedClasses: {
    class: { name: string };
    section: { name: string };
    subject: { name: string };
  }[];
  studentCount: number;
  recentNotices: NoticeItem[];
}

export interface ParentDashboard {
  role: Role;
  profileLinked: boolean;
  children: {
    _id: string;
    name: string;
    photoUrl?: string;
    admissionNumber: string;
    currentClass?: { name: string };
    section?: { name: string };
  }[];
  recentNotices: NoticeItem[];
}

export interface StudentDashboard {
  role: Role;
  profileLinked: boolean;
  admissionNumber?: string;
  rollNumber?: string;
  currentClass?: { name: string };
  section?: { name: string };
  house?: string;
  recentNotices: NoticeItem[];
}

export type DashboardResponse =
  | StaffDashboard
  | TeacherDashboard
  | ParentDashboard
  | StudentDashboard;

export async function fetchDashboard() {
  const res = await apiFetch<DashboardResponse>("/api/dashboard");
  return res.data as DashboardResponse;
}
