import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ComingSoon } from "@/components/shared/coming-soon";

export default async function HostelPage() {
  await requirePermission(PERMISSIONS.HOSTEL_MANAGE);
  return <ComingSoon title="Hostel management" />;
}
