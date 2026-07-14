import { GraduationCap, UsersRound, BookOpenCheck } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { GenderSplitChart, ClassStrengthChart } from "@/components/dashboard/charts";
import { NoticeList } from "@/components/dashboard/notice-list";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import type { StaffDashboard } from "@/services/dashboard.service";

export function OverviewDashboard({ data, title }: { data: StaffDashboard; title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening at your school.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active students" value={data.totalStudents} icon={GraduationCap} delay={0} />
        <StatCard
          label="Active teachers"
          value={data.totalTeachers}
          icon={UsersRound}
          accent="success"
          delay={0.05}
        />
        <StatCard
          label="Classes"
          value={data.totalClasses}
          icon={BookOpenCheck}
          accent="accent"
          delay={0.1}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GenderSplitChart data={data.genderSplit} />
        <ClassStrengthChart data={data.classStrength} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NoticeList notices={data.recentNotices} />
        <ActivityFeed items={data.recentActivity} />
      </div>
    </div>
  );
}
