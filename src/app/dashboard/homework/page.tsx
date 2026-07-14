import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ComingSoon } from "@/components/shared/coming-soon";

export default async function HomeworkPage() {
  await requirePermission(PERMISSIONS.HOMEWORK_VIEW);
  return <ComingSoon title="Homework" />;
}
