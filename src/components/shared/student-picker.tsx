"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { fetchStudents } from "@/services/student.service";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { initials } from "@/lib/utils";

export interface PickedStudent {
  id: string;
  name: string;
  admissionNumber: string;
  photoUrl?: string;
}

export function StudentPicker({
  value,
  onChange,
  placeholder = "Search student by name or admission no.",
}: {
  value: PickedStudent | null;
  onChange: (student: PickedStudent | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["students", "picker", search],
    queryFn: () => fetchStudents({ page: 1, limit: 8, search }),
    enabled: open && search.length > 0,
  });

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
        <Avatar className="size-7">
          {value.photoUrl ? <AvatarImage src={value.photoUrl} alt={value.name} /> : null}
          <AvatarFallback className="text-xs">{initials(value.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-sm">
          <p className="font-medium leading-none">{value.name}</p>
          <p className="text-xs text-muted-foreground">{value.admissionNumber}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={() => onChange(null)}>
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-1">
        {isFetching && (
          <div className="space-y-2 p-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {!isFetching && search.length > 0 && data?.items.length === 0 && (
          <p className="p-3 text-center text-sm text-muted-foreground">No students found.</p>
        )}
        {data?.items.map((student) => (
          <button
            key={student._id}
            type="button"
            onClick={() => {
              onChange({
                id: student._id,
                name: student.name,
                admissionNumber: student.admissionNumber,
                photoUrl: student.photoUrl,
              });
              setOpen(false);
              setSearch("");
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-accent"
          >
            <Avatar className="size-7">
              {student.photoUrl ? <AvatarImage src={student.photoUrl} alt={student.name} /> : null}
              <AvatarFallback className="text-xs">{initials(student.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium leading-none">{student.name}</p>
              <p className="text-xs text-muted-foreground">{student.admissionNumber}</p>
            </div>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
