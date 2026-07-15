"use client";

import { useForm, useFieldArray, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  createTeacherSchema,
  type CreateTeacherInput,
} from "@/validators/teacher.validator";
import { useCreateTeacher, useUpdateTeacher } from "@/hooks/use-teachers";
import { useClassOptions, useSubjectOptions } from "@/hooks/use-academics";
import type { ClassOption, SubjectOption } from "@/services/academics.service";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { ApiClientError } from "@/lib/api-client";
import { STAFF_STATUSES } from "@/models/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const emptyDefaults: CreateTeacherInput = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  photoUrl: "",
  qualification: "",
  designation: "",
  subjects: [],
  assignedClasses: [],
  experienceYears: 0,
  joiningDate: "",
  status: "active",
};

export function TeacherForm({
  teacherId,
  defaultValues,
}: {
  teacherId?: string;
  defaultValues?: Partial<CreateTeacherInput>;
}) {
  const router = useRouter();
  const { data: classes = [] } = useClassOptions();
  const { data: subjects = [] } = useSubjectOptions();

  const form = useForm<CreateTeacherInput>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  const watchedName = useWatch({ control: form.control, name: "name" });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assignedClasses",
  });

  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher(teacherId ?? "");
  const mutation = teacherId ? updateMutation : createMutation;

  function onSubmit(values: CreateTeacherInput) {
    mutation.mutate(values, {
      onSuccess: (result) => {
        toast.success(teacherId ? "Teacher updated" : "Teacher added");
        router.push(`/dashboard/teachers/${teacherId ?? result?.id}`);
      },
      onError: (error) => {
        toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!!teacherId} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={!!teacherId} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo (optional)</FormLabel>
                  <FormControl>
                    <PhotoUpload value={field.value ?? ""} onChange={field.onChange} folder="teachers" name={watchedName} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification</FormLabel>
                  <FormControl>
                    <Input placeholder="M.Sc, B.Ed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="PGT, TGT…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experienceYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience (years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="joiningDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Joining date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STAFF_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects taught</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap gap-3">
                    {subjects.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No subjects configured yet.
                      </p>
                    )}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Assigned classes</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ class: "", section: "", subject: "" })}
            >
              <Plus className="size-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">No classes assigned yet.</p>
            )}
            {fields.map((item, index) => (
              <AssignedClassRow
                key={item.id}
                control={form.control}
                index={index}
                classes={classes}
                subjects={subjects}
                onRemove={() => remove(index)}
                onClassChange={() => form.setValue(`assignedClasses.${index}.section`, "")}
              />
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {teacherId ? "Save changes" : "Add teacher"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function AssignedClassRow({
  control,
  index,
  classes,
  subjects,
  onRemove,
  onClassChange,
}: {
  control: Control<CreateTeacherInput>;
  index: number;
  classes: ClassOption[];
  subjects: SubjectOption[];
  onRemove: () => void;
  onClassChange: () => void;
}) {
  const selectedClassId = useWatch({ control, name: `assignedClasses.${index}.class` });
  const sections = classes.find((c) => c.id === selectedClassId)?.sections ?? [];

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-3">
      <FormField
        control={control}
        name={`assignedClasses.${index}.class`}
        render={({ field }) => (
          <FormItem className="min-w-36 flex-1">
            <FormLabel>Class</FormLabel>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                onClassChange();
              }}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`assignedClasses.${index}.section`}
        render={({ field }) => (
          <FormItem className="min-w-32 flex-1">
            <FormLabel>Section</FormLabel>
            <Select value={field.value} onValueChange={field.onChange} disabled={!sections.length}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`assignedClasses.${index}.subject`}
        render={({ field }) => (
          <FormItem className="min-w-36 flex-1">
            <FormLabel>Subject</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
