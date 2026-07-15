"use client";

import { useClassOptions } from "@/hooks/use-academics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ClassSectionPicker({
  classId,
  sectionId,
  onClassChange,
  onSectionChange,
}: {
  classId: string;
  sectionId: string;
  onClassChange: (classId: string) => void;
  onSectionChange: (sectionId: string) => void;
}) {
  const { data: classes = [] } = useClassOptions();
  const sections = classes.find((c) => c.id === classId)?.sections ?? [];

  return (
    <div className="flex flex-wrap gap-3">
      <div className="space-y-1.5">
        <Label>Class</Label>
        <Select
          value={classId}
          onValueChange={(value) => {
            onClassChange(value);
            onSectionChange("");
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                Class {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Section</Label>
        <Select value={sectionId} onValueChange={onSectionChange} disabled={!sections.length}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
