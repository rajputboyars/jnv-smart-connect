"use client";

import { useState } from "react";
import Link from "next/link";
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
import { useTeachers, useDeleteTeacher } from "@/hooks/use-teachers";
import { initials } from "@/lib/utils";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { useAuth } from "@/hooks/use-auth";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "outline"> = {
  active: "success",
  inactive: "outline",
  on_leave: "warning",
  resigned: "default",
};

export function TeacherTable() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useTeachers({ page, limit: 10, search });
  const deleteMutation = useDeleteTeacher();

  const canCreate = user && can(user.role, PERMISSIONS.TEACHERS_CREATE);
  const canUpdate = user && can(user.role, PERMISSIONS.TEACHERS_UPDATE);
  const canDelete = user && can(user.role, PERMISSIONS.TEACHERS_DELETE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Teachers</h1>
          <p className="text-sm text-muted-foreground">Manage teaching staff and assignments.</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/teachers/new">
              <Plus className="size-4" /> Add teacher
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
          placeholder="Search by name, employee ID or email"
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Subjects</TableHead>
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
                No teachers found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            data?.items.map((teacher) => (
              <TableRow key={teacher._id} className={isFetching ? "opacity-60" : undefined}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {teacher.photoUrl ? <AvatarImage src={teacher.photoUrl} alt={teacher.name} /> : null}
                      <AvatarFallback>{initials(teacher.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{teacher.employeeId}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.slice(0, 2).map((s) => (
                      <Badge key={s._id} variant="secondary">
                        {s.name}
                      </Badge>
                    ))}
                    {teacher.subjects.length > 2 && (
                      <Badge variant="outline">+{teacher.subjects.length - 2}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[teacher.status] ?? "outline"}>{teacher.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/teachers/${teacher._id}`} aria-label="View">
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    {canUpdate && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/teachers/${teacher._id}/edit`} aria-label="Edit">
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => setDeleteId(teacher._id)}
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
        title="Remove teacher?"
        description="This permanently deletes the teacher's record and login. This action cannot be undone."
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
