"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useStudents, useDeleteStudent } from "@/hooks/use-students";
import { initials } from "@/lib/utils";
import { can } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { useAuth } from "@/hooks/use-auth";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "outline"> = {
  active: "success",
  inactive: "outline",
  alumni: "default",
  transferred: "warning",
};

export function StudentTable() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParam);
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Re-sync when the URL's ?search= changes (e.g. a fresh search from the
  // global navbar while already on this page) — local state alone wouldn't
  // pick that up. Uses React's render-time "reset state on prop change"
  // pattern rather than an effect.
  const [lastParam, setLastParam] = useState(searchParam);
  if (searchParam !== lastParam) {
    setLastParam(searchParam);
    setSearch(searchParam);
    setPage(1);
  }

  // Debounce the query term so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isFetching } = useStudents({ page, limit: 10, search: debouncedSearch });
  const deleteMutation = useDeleteStudent();

  const canCreate = user && can(user.role, PERMISSIONS.STUDENTS_CREATE);
  const canUpdate = user && can(user.role, PERMISSIONS.STUDENTS_UPDATE);
  const canDelete = user && can(user.role, PERMISSIONS.STUDENTS_DELETE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">Manage student admissions and profiles.</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/students/new">
              <Plus className="size-4" /> Add student
            </Link>
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, admission or roll no."
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Admission No.</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={5}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && data?.items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                No students found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            data?.items.map((student) => (
              <TableRow key={student._id} className={isFetching ? "opacity-60" : undefined}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {student.photoUrl ? <AvatarImage src={student.photoUrl} alt={student.name} /> : null}
                      <AvatarFallback>{initials(student.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{student.name}</span>
                  </div>
                </TableCell>
                <TableCell>{student.admissionNumber}</TableCell>
                <TableCell>
                  {student.currentClass?.name ? `${student.currentClass.name} - ${student.section?.name ?? ""}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[student.status] ?? "outline"}>{student.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/students/${student._id}`} aria-label="View">
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    {canUpdate && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/students/${student._id}/edit`} aria-label="Edit">
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => setDeleteId(student._id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove student?"
        description="This permanently deletes the student's record. This action cannot be undone."
        confirmLabel="Remove"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
      />
    </div>
  );
}
