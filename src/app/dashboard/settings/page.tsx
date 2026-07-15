import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ComingSoon } from "@/components/shared/coming-soon";

export default async function SettingsPage() {
  await requirePermission(PERMISSIONS.SCHOOL_SETTINGS_MANAGE);
  return <ComingSoon title="School settings" />;
}
