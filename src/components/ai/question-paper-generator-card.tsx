"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuestionPaperGenerator } from "@/hooks/use-ai";
import type { QuestionPaperInput } from "@/validators/ai.validator";

const DEFAULTS: QuestionPaperInput = {
  subject: "",
  topic: "",
  className: "",
  difficulty: "medium",
  questionCount: 10,
  totalMarks: 50,
};

export function QuestionPaperGeneratorCard() {
  const [form, setForm] = useState<QuestionPaperInput>(DEFAULTS);
  const mutation = useQuestionPaperGenerator();

  const canSubmit = form.subject.trim().length > 1 && form.topic.trim().length > 1 && form.className.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question paper generator</CardTitle>
        <CardDescription>Creates a full question paper with marks allocation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Class</Label>
            <Input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="X" />
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Mathematics" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Topic</Label>
          <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Quadratic equations" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as QuestionPaperInput["difficulty"] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Questions</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={form.questionCount}
              onChange={(e) => setForm({ ...form, questionCount: e.target.valueAsNumber || 1 })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Total marks</Label>
            <Input
              type="number"
              min={5}
              max={200}
              value={form.totalMarks}
              onChange={(e) => setForm({ ...form, totalMarks: e.target.valueAsNumber || 5 })}
            />
          </div>
        </div>
        <Button disabled={!canSubmit} loading={mutation.isPending} onClick={() => mutation.mutate(form)}>
          <Sparkles className="size-4" /> Generate paper
        </Button>
        {mutation.data && <Textarea readOnly value={mutation.data.paper} className="min-h-56" />}
      </CardContent>
    </Card>
  );
}
