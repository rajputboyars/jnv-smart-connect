import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { LibraryView } from "@/components/library/library-view";

export default async function LibraryPage() {
  await requirePermission(PERMISSIONS.LIBRARY_VIEW);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Library</h1>
        <p className="text-sm text-muted-foreground">Browse the catalog, issue and return books.</p>
      </div>
      <LibraryView />
    </div>
  );
}
