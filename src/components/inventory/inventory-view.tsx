"use client";

import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetListPanel } from "@/components/inventory/asset-list-panel";
import { StockPanel } from "@/components/inventory/stock-panel";
import { RequestsPanel } from "@/components/inventory/requests-panel";
import { PurchaseOrderPanel } from "@/components/inventory/purchase-order-panel";

export function InventoryView() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <Skeleton className="h-96 w-full rounded-xl" />;

  const canManage = can(user.role, PERMISSIONS.INVENTORY_MANAGE);

  return (
    <Tabs defaultValue="assets">
      <TabsList>
        <TabsTrigger value="assets">Assets</TabsTrigger>
        {canManage && <TabsTrigger value="stock">Stock &amp; Consumables</TabsTrigger>}
        <TabsTrigger value="requests">Requests</TabsTrigger>
        {canManage && <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>}
      </TabsList>
      <TabsContent value="assets">
        <AssetListPanel />
      </TabsContent>
      {canManage && (
        <TabsContent value="stock">
          <StockPanel />
        </TabsContent>
      )}
      <TabsContent value="requests">
        <RequestsPanel />
      </TabsContent>
      {canManage && (
        <TabsContent value="purchase-orders">
          <PurchaseOrderPanel />
        </TabsContent>
      )}
    </Tabs>
  );
}
