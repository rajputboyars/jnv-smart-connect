import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ComingSoon } from "@/components/shared/coming-soon";

export default async function AcademicsPage() {
  await requirePermission(PERMISSIONS.ACADEMICS_MANAGE);
  return <ComingSoon title="Classes, sections & subjects" />;
}
