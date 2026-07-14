import { BookOpenCheck, GraduationCap, Layers } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { NoticeList } from "@/components/dashboard/notice-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TeacherDashboard as TeacherDashboardData } from "@/services/dashboard.service";

export function TeacherDashboard({ data }: { data: TeacherDashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s your teaching overview.</p>
      </div>

      {!data.profileLinked ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Your teacher profile hasn&apos;t been linked yet. Contact your Principal or Super
            Admin.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Assigned classes" value={data.assignedClasses.length} icon={Layers} />
            <StatCard
              label="Subjects"
              value={data.subjects.length}
              icon={BookOpenCheck}
              accent="success"
              delay={0.05}
            />
            <StatCard
              label="Students taught"
              value={data.studentCount}
              icon={GraduationCap}
              accent="accent"
              delay={0.1}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.assignedClasses.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No classes assigned yet.
                </p>
              )}
              {data.assignedClasses.map((ac, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border/60 py-2 last:border-0"
                >
                  <span className="text-sm font-medium">
                    Class {ac.class?.name} - {ac.section?.name}
                  </span>
                  <Badge variant="secondary">{ac.subject?.name}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <NoticeList notices={data.recentNotices} />
    </div>
  );
}
