"use client";

import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketsPanel } from "@/components/maintenance/tickets-panel";
import { TechniciansPanel } from "@/components/maintenance/technicians-panel";

export function MaintenanceView() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <Skeleton className="h-96 w-full rounded-xl" />;

  const canManage = can(user.role, PERMISSIONS.MAINTENANCE_MANAGE);

  return (
    <Tabs defaultValue="tickets">
      <TabsList>
        <TabsTrigger value="tickets">Tickets</TabsTrigger>
        {canManage && <TabsTrigger value="technicians">Technicians</TabsTrigger>}
      </TabsList>
      <TabsContent value="tickets">
        <TicketsPanel />
      </TabsContent>
      {canManage && (
        <TabsContent value="technicians">
          <TechniciansPanel />
        </TabsContent>
      )}
    </Tabs>
  );
}
