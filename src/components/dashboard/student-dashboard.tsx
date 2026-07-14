import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoticeList } from "@/components/dashboard/notice-list";
import type { StudentDashboard as StudentDashboardData } from "@/services/dashboard.service";

export function StudentDashboard({ data }: { data: StudentDashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Your dashboard</h1>
        <p className="text-sm text-muted-foreground">Stay on top of school life.</p>
      </div>

      {!data.profileLinked ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Your student profile hasn&apos;t been linked yet. Contact your school office.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 py-6">
            <Badge>Class {data.currentClass?.name}</Badge>
            <Badge variant="secondary">Section {data.section?.name}</Badge>
            {data.house && <Badge variant="outline">{data.house} House</Badge>}
            <Badge variant="outline">Admission No. {data.admissionNumber}</Badge>
            {data.rollNumber && <Badge variant="outline">Roll No. {data.rollNumber}</Badge>}
          </CardContent>
        </Card>
      )}

      <NoticeList notices={data.recentNotices} />
    </div>
  );
}
