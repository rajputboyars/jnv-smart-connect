import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ComingSoon } from "@/components/shared/coming-soon";

export default async function ParentsPage() {
  await requirePermission(PERMISSIONS.PARENTS_VIEW);
  return <ComingSoon title="Parents directory" />;
}
