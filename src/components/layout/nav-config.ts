import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  GraduationCap,
  UsersRound,
  UserRound,
  BookOpenCheck,
  CalendarCheck,
  ClipboardList,
  NotebookPen,
  Library,
  BedDouble,
  Wallet,
  Bell,
  ScrollText,
  Settings,
} from "lucide-react";
import { PERMISSIONS, type Permission } from "@/lib/auth/rbac";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
  { label: "Students", href: "/dashboard/students", icon: GraduationCap, permission: PERMISSIONS.STUDENTS_VIEW },
  { label: "Teachers", href: "/dashboard/teachers", icon: UsersRound, permission: PERMISSIONS.TEACHERS_VIEW },
  { label: "Parents", href: "/dashboard/parents", icon: UserRound, permission: PERMISSIONS.PARENTS_VIEW },
  { label: "Academics", href: "/dashboard/academics", icon: BookOpenCheck, permission: PERMISSIONS.ACADEMICS_MANAGE },
  { label: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck, permission: PERMISSIONS.ATTENDANCE_VIEW },
  { label: "Homework", href: "/dashboard/homework", icon: ClipboardList, permission: PERMISSIONS.HOMEWORK_VIEW },
  { label: "Exams", href: "/dashboard/exams", icon: NotebookPen, permission: PERMISSIONS.EXAMS_VIEW },
  { label: "Library", href: "/dashboard/library", icon: Library, permission: PERMISSIONS.LIBRARY_MANAGE },
  { label: "Hostel", href: "/dashboard/hostel", icon: BedDouble, permission: PERMISSIONS.HOSTEL_MANAGE },
  { label: "Accounts", href: "/dashboard/accounts", icon: Wallet, permission: PERMISSIONS.ACCOUNTS_MANAGE },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, permission: PERMISSIONS.NOTIFICATIONS_VIEW },
  { label: "Activity Logs", href: "/dashboard/activity-logs", icon: ScrollText, permission: PERMISSIONS.ACTIVITY_LOGS_VIEW },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, permission: PERMISSIONS.SCHOOL_SETTINGS_MANAGE },
];
