"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { StudentPicker, type PickedStudent } from "@/components/shared/student-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useReportCardNarrative } from "@/hooks/use-ai";

export function ReportCardNarrativeCard() {
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const [highlights, setHighlights] = useState("");
  const mutation = useReportCardNarrative();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report card remark</CardTitle>
        <CardDescription>
          Writes a short, constructive remark from this student&apos;s real attendance/health record plus your
          own notes below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <StudentPicker value={student} onChange={setStudent} />
        <div className="space-y-1.5">
          <Label>Your notes (optional)</Label>
          <Textarea
            placeholder="e.g. Improved a lot in Mathematics this term, still needs to work on handwriting…"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
          />
        </div>
        <Button
          disabled={!student}
          loading={mutation.isPending}
          onClick={() => student && mutation.mutate({ studentId: student.id, highlights })}
        >
          <Sparkles className="size-4" /> Generate remark
        </Button>
        {mutation.data && <Textarea readOnly value={mutation.data.narrative} className="min-h-32" />}
      </CardContent>
    </Card>
  );
}
