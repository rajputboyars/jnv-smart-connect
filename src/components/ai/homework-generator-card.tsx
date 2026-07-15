"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHomeworkGenerator } from "@/hooks/use-ai";
import type { HomeworkGeneratorInput } from "@/validators/ai.validator";

const DEFAULTS: HomeworkGeneratorInput = {
  subject: "",
  topic: "",
  className: "",
  difficulty: "medium",
  questionCount: 5,
};

export function HomeworkGeneratorCard() {
  const [form, setForm] = useState<HomeworkGeneratorInput>(DEFAULTS);
  const mutation = useHomeworkGenerator();

  const canSubmit = form.subject.trim().length > 1 && form.topic.trim().length > 1 && form.className.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homework generator</CardTitle>
        <CardDescription>Creates a homework question set for a class and topic.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Class</Label>
            <Input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="VIII" />
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Science" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Topic</Label>
          <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Photosynthesis" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as HomeworkGeneratorInput["difficulty"] })}>
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
            <Label>Number of questions</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={form.questionCount}
              onChange={(e) => setForm({ ...form, questionCount: e.target.valueAsNumber || 1 })}
            />
          </div>
        </div>
        <Button disabled={!canSubmit} loading={mutation.isPending} onClick={() => mutation.mutate(form)}>
          <Sparkles className="size-4" /> Generate homework
        </Button>
        {mutation.data && <Textarea readOnly value={mutation.data.homework} className="min-h-48" />}
      </CardContent>
    </Card>
  );
}
