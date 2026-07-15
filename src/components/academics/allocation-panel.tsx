"use client";

import { useTeacherAllocations } from "@/hooks/use-teachers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function AllocationPanel() {
  const { data: teachers, isLoading } = useTeacherAllocations();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  const withAssignments = teachers?.filter((t) => t.assignedClasses.length > 0) ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Which teacher teaches which subject, class and section — edit assignments from a
        teacher&apos;s profile.
      </p>

      {withAssignments.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No subject allocations yet. Assign classes from a teacher&apos;s edit page.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {withAssignments.map((teacher) => (
          <Card key={teacher.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {teacher.name} <span className="font-normal text-muted-foreground">({teacher.employeeId})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {teacher.assignedClasses.map((ac, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
                  <span className="text-sm">
                    Class {ac.class?.name} - {ac.section?.name}
                  </span>
                  <Badge variant="secondary">{ac.subject?.name}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
