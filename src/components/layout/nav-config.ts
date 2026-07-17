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
  HeartPulse,
  Wallet,
  Bell,
  ScrollText,
  Settings,
  BarChart3,
  Sparkles,
  Boxes,
  Briefcase,
  Wrench,
  PartyPopper,
} from "lucide-react";
import { PERMISSIONS, type Permission } from "@/lib/auth/rbac";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Holding any one of these is enough to see the nav item. */
  permission: Permission | Permission[];
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
  { label: "Library", href: "/dashboard/library", icon: Library, permission: PERMISSIONS.LIBRARY_VIEW },
  { label: "Hostel", href: "/dashboard/hostel", icon: BedDouble, permission: PERMISSIONS.HOSTEL_VIEW },
  { label: "Health", href: "/dashboard/health", icon: HeartPulse, permission: PERMISSIONS.HEALTH_VIEW },
  {
    label: "Accounts & Finance",
    href: "/dashboard/accounts",
    icon: Wallet,
    permission: [PERMISSIONS.ACCOUNTS_MANAGE, PERMISSIONS.FINANCE_VIEW],
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: Boxes,
    permission: [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE],
  },
  {
    label: "HR",
    href: "/dashboard/hr",
    icon: Briefcase,
    permission: [PERMISSIONS.HR_VIEW, PERMISSIONS.HR_MANAGE],
  },
  {
    label: "Maintenance",
    href: "/dashboard/maintenance",
    icon: Wrench,
    permission: [PERMISSIONS.MAINTENANCE_VIEW, PERMISSIONS.MAINTENANCE_MANAGE],
  },
  {
    label: "Events",
    href: "/dashboard/events",
    icon: PartyPopper,
    permission: [PERMISSIONS.EVENTS_VIEW, PERMISSIONS.EVENTS_MANAGE],
  },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, permission: PERMISSIONS.NOTIFICATIONS_VIEW },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, permission: PERMISSIONS.ANALYTICS_VIEW },
  { label: "AI Assist", href: "/dashboard/ai-assist", icon: Sparkles, permission: PERMISSIONS.AI_ASSIST_USE },
  { label: "Activity Logs", href: "/dashboard/activity-logs", icon: ScrollText, permission: PERMISSIONS.ACTIVITY_LOGS_VIEW },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, permission: PERMISSIONS.SCHOOL_SETTINGS_MANAGE },
];
