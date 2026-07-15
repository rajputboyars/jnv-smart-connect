import { requireSession } from "@/lib/auth/dal";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return <DashboardShell role={session.role}>{children}</DashboardShell>;
}
