"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { StudentPicker, type PickedStudent } from "@/components/shared/student-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useParentSummary } from "@/hooks/use-ai";

export function ParentSummaryCard() {
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const mutation = useParentSummary();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent update summary</CardTitle>
        <CardDescription>
          Drafts a short, factual update for a parent from this student&apos;s real attendance and health
          records — nothing is invented.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <StudentPicker value={student} onChange={setStudent} />
        <Button
          disabled={!student}
          loading={mutation.isPending}
          onClick={() => student && mutation.mutate(student.id)}
        >
          <Sparkles className="size-4" /> Generate summary
        </Button>
        {mutation.data && <Textarea readOnly value={mutation.data.summary} className="min-h-40" />}
      </CardContent>
    </Card>
  );
}
