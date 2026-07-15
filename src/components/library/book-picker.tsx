"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { fetchBooks } from "@/services/library.service";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface PickedBook {
  id: string;
  title: string;
  accessionNumber: string;
  availableCopies: number;
}

export function BookPicker({
  value,
  onChange,
}: {
  value: PickedBook | null;
  onChange: (book: PickedBook | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["books", "picker", search],
    queryFn: () => fetchBooks({ page: 1, limit: 8, search }),
    enabled: open && search.length > 0,
  });

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
        <div className="flex-1 text-sm">
          <p className="font-medium leading-none">{value.title}</p>
          <p className="text-xs text-muted-foreground">
            {value.accessionNumber} &middot; {value.availableCopies} available
          </p>
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
            placeholder="Search book by title or accession no."
            className="pl-9"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-1">
        {isFetching && (
          <div className="space-y-2 p-2">
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {!isFetching && search.length > 0 && data?.items.length === 0 && (
          <p className="p-3 text-center text-sm text-muted-foreground">No books found.</p>
        )}
        {data?.items.map((book) => (
          <button
            key={book._id}
            type="button"
            disabled={book.availableCopies < 1}
            onClick={() => {
              onChange({
                id: book._id,
                title: book.title,
                accessionNumber: book.accessionNumber,
                availableCopies: book.availableCopies,
              });
              setOpen(false);
              setSearch("");
            }}
            className="flex w-full flex-col items-start rounded-lg px-2 py-2 text-left text-sm hover:bg-accent disabled:opacity-40"
          >
            <p className="font-medium leading-none">{book.title}</p>
            <p className="text-xs text-muted-foreground">
              {book.accessionNumber} &middot; {book.availableCopies} available
            </p>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
