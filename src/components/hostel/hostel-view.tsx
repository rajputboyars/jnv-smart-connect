"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { ROLES } from "@/types/roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BuildingsRoomsPanel } from "@/components/hostel/buildings-rooms-panel";
import { AllocationPanel } from "@/components/hostel/allocation-panel";
import { NightAttendancePanel } from "@/components/hostel/night-attendance-panel";
import { LeaveRequestsPanel } from "@/components/hostel/leave-requests-panel";
import { GatePassPanel } from "@/components/hostel/gate-pass-panel";
import { VisitorLogPanel } from "@/components/hostel/visitor-log-panel";
import { MyHostelStatus } from "@/components/hostel/my-hostel-status";
import type { ParentDashboard } from "@/services/dashboard.service";

export function HostelView() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <Skeleton className="h-96 w-full rounded-xl" />;

  if (user.role === ROLES.STUDENT) {
    return (
      <div className="space-y-6">
        <MyHostelStatus />
        <LeaveRequestsPanel />
      </div>
    );
  }

  if (user.role === ROLES.PARENT) {
    return <ParentHostelView />;
  }

  const canManage = can(user.role, PERMISSIONS.HOSTEL_MANAGE);

  if (!canManage) {
    return <LeaveRequestsPanel />;
  }

  return (
    <Tabs defaultValue="buildings">
      <TabsList className="w-full flex-wrap justify-start">
        <TabsTrigger value="buildings">Buildings &amp; Rooms</TabsTrigger>
        <TabsTrigger value="allocation">Allocation</TabsTrigger>
        <TabsTrigger value="attendance">Night Attendance</TabsTrigger>
        <TabsTrigger value="leave">Leave Requests</TabsTrigger>
        <TabsTrigger value="gatepass">Gate Pass</TabsTrigger>
        <TabsTrigger value="visitors">Visitors</TabsTrigger>
      </TabsList>
      <TabsContent value="buildings">
        <BuildingsRoomsPanel />
      </TabsContent>
      <TabsContent value="allocation">
        <AllocationPanel />
      </TabsContent>
      <TabsContent value="attendance">
        <NightAttendancePanel />
      </TabsContent>
      <TabsContent value="leave">
        <LeaveRequestsPanel />
      </TabsContent>
      <TabsContent value="gatepass">
        <GatePassPanel />
      </TabsContent>
      <TabsContent value="visitors">
        <VisitorLogPanel />
      </TabsContent>
    </Tabs>
  );
}

function ParentHostelView() {
  const { data, isLoading } = useDashboard();
  const [studentId, setStudentId] = useState<string | null>(null);

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;

  const parentData = data as ParentDashboard | undefined;
  const children = parentData?.children ?? [];

  if (children.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No children linked to your account yet.
      </p>
    );
  }

  const activeId = studentId ?? children[0]._id;

  return (
    <div className="space-y-6">
      {children.length > 1 && (
        <div className="max-w-xs space-y-1.5">
          <Label>Child</Label>
          <Select value={activeId} onValueChange={setStudentId}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child._id} value={child._id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <MyHostelStatus studentId={activeId} />
      <LeaveRequestsPanel />
    </div>
  );
}
