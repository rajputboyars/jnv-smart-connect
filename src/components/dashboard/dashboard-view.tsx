"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { ParentDashboard } from "@/components/dashboard/parent-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { ROLES, ROLE_LABELS } from "@/types/roles";
import type {
  StaffDashboard,
  TeacherDashboard as TeacherDashboardData,
  ParentDashboard as ParentDashboardData,
  StudentDashboard as StudentDashboardData,
} from "@/services/dashboard.service";

export function DashboardView() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Couldn&apos;t load your dashboard. Please refresh.
      </p>
    );
  }

  switch (data.role) {
    case ROLES.TEACHER:
      return <TeacherDashboard data={data as TeacherDashboardData} />;
    case ROLES.PARENT:
      return <ParentDashboard data={data as ParentDashboardData} />;
    case ROLES.STUDENT:
      return <StudentDashboard data={data as StudentDashboardData} />;
    default:
      return (
        <OverviewDashboard data={data as StaffDashboard} title={`${ROLE_LABELS[data.role]} Dashboard`} />
      );
  }
}
