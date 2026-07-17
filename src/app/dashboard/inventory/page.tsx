import { requireAnyPermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { InventoryView } from "@/components/inventory/inventory-view";

export default async function InventoryPage() {
  await requireAnyPermission([PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Inventory Management</h1>
        <p className="text-sm text-muted-foreground">
          Assets, stock &amp; consumables, requests, and purchase orders.
        </p>
      </div>
      <InventoryView />
    </div>
  );
}
