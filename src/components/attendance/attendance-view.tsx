"use client";

import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { ROLES } from "@/types/roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkStudentAttendance } from "@/components/attendance/mark-student-attendance";
import { MarkTeacherAttendance } from "@/components/attendance/mark-teacher-attendance";
import { ClassAttendanceReport } from "@/components/attendance/class-attendance-report";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { ParentAttendanceView } from "@/components/attendance/parent-attendance-view";

export function AttendanceView() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <Skeleton className="h-96 w-full rounded-xl" />;

  if (user.role === ROLES.STUDENT) {
    return <AttendanceCalendar />;
  }

  if (user.role === ROLES.PARENT) {
    return <ParentAttendanceView />;
  }

  const canMark = can(user.role, PERMISSIONS.ATTENDANCE_MARK);
  const canMarkStaff = can(user.role, PERMISSIONS.STAFF_ATTENDANCE_MARK);

  return (
    <Tabs defaultValue={canMark ? "mark" : "report"}>
      <TabsList className="w-full flex-wrap justify-start">
        {canMark && <TabsTrigger value="mark">Mark Attendance</TabsTrigger>}
        <TabsTrigger value="report">Class Report</TabsTrigger>
        {canMarkStaff && <TabsTrigger value="staff">Teacher Attendance</TabsTrigger>}
      </TabsList>
      {canMark && (
        <TabsContent value="mark">
          <MarkStudentAttendance />
        </TabsContent>
      )}
      <TabsContent value="report">
        <ClassAttendanceReport />
      </TabsContent>
      {canMarkStaff && (
        <TabsContent value="staff">
          <MarkTeacherAttendance />
        </TabsContent>
      )}
    </Tabs>
  );
}
