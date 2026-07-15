import { requirePermission } from "@/lib/auth/dal";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { AiAssistView } from "@/components/ai/ai-assist-view";

export default async function AiAssistPage() {
  await requirePermission(PERMISSIONS.AI_ASSIST_USE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">AI Assist</h1>
        <p className="text-sm text-muted-foreground">
          Claude-powered drafting tools and a rule-based risk indicator, grounded in this school&apos;s real
          records.
        </p>
      </div>
      <AiAssistView />
    </div>
  );
}
