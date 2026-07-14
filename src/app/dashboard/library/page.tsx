import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ComingSoon } from "@/components/shared/coming-soon";

export default async function LibraryPage() {
  await requirePermission(PERMISSIONS.LIBRARY_MANAGE);
  return <ComingSoon title="Library" />;
}
