"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createClassSchema, type CreateClassInput } from "@/validators/academics.validator";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useAcademicYears,
  useSubjectOptions,
} from "@/hooks/use-academics";
import type { ClassItem } from "@/services/academics.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const emptyDefaults: CreateClassInput = {
  name: "",
  numericLevel: 6,
  academicYear: "",
  subjects: [],
};

export function ClassesPanel() {
  const { data: classes, isLoading } = useClasses();
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteClass();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Classes offered this academic session.</p>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> New class
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Academic year</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Sections</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5}>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && classes?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                No classes yet.
              </TableCell>
            </TableRow>
          )}
          {classes?.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell className="font-medium">Class {cls.name}</TableCell>
              <TableCell>{cls.academicYear?.name ?? "—"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {cls.subjects.slice(0, 3).map((s) => (
                    <Badge key={s._id} variant="secondary">
                      {s.name}
                    </Badge>
                  ))}
                  {cls.subjects.length > 3 && <Badge variant="outline">+{cls.subjects.length - 3}</Badge>}
                </div>
              </TableCell>
              <TableCell>{cls.sectionCount}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(cls);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(cls.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ClassDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove class?"
        description="You can only remove a class that has no sections or enrolled students."
        confirmLabel="Remove"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
      />
    </div>
  );
}

function ClassDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ClassItem | null;
}) {
  const { data: academicYears = [] } = useAcademicYears();
  const { data: subjects = [] } = useSubjectOptions();

  const form = useForm<CreateClassInput>({
    resolver: zodResolver(createClassSchema),
    values: editing
      ? {
          name: editing.name,
          numericLevel: editing.numericLevel,
          academicYear: editing.academicYear?._id ?? "",
          subjects: editing.subjects.map((s) => s._id),
        }
      : emptyDefaults,
  });

  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass(editing?.id ?? "");
  const mutation = editing ? updateMutation : createMutation;

  function onSubmit(values: CreateClassInput) {
    mutation.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset(emptyDefaults);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit class" : "New class"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="VI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numericLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic year</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears.map((y) => (
                        <SelectItem key={y.id} value={y.id}>
                          {y.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjects</FormLabel>
                  <div className="flex flex-wrap gap-3">
                    {subjects.map((subject) => {
                      const checked = field.value.includes(subject.id);
                      return (
                        <label
                          key={subject.id}
                          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              field.onChange(
                                value
                                  ? [...field.value, subject.id]
                                  : field.value.filter((id) => id !== subject.id)
                              );
                            }}
                          />
                          {subject.name}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" loading={mutation.isPending}>
                {editing ? "Save changes" : "Create class"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
