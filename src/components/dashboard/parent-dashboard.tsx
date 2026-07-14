import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NoticeList } from "@/components/dashboard/notice-list";
import { initials } from "@/lib/utils";
import type { ParentDashboard as ParentDashboardData } from "@/services/dashboard.service";

export function ParentDashboard({ data }: { data: ParentDashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Your children</h1>
        <p className="text-sm text-muted-foreground">
          Track attendance, homework and progress for each child.
        </p>
      </div>

      {!data.profileLinked ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Your parent profile hasn&apos;t been linked to any student yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.children.length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No children linked to your account yet.
              </CardContent>
            </Card>
          )}
          {data.children.map((child) => (
            <Card key={child._id}>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Avatar className="size-12">
                  {child.photoUrl ? <AvatarImage src={child.photoUrl} alt={child.name} /> : null}
                  <AvatarFallback>{initials(child.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{child.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Class {child.currentClass?.name} - {child.section?.name}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Admission No. {child.admissionNumber}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NoticeList notices={data.recentNotices} />
    </div>
  );
}
