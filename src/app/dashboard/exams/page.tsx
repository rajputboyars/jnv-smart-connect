import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ComingSoon } from "@/components/shared/coming-soon";

export default async function ExamsPage() {
  await requirePermission(PERMISSIONS.EXAMS_VIEW);
  return <ComingSoon title="Exams" />;
}
