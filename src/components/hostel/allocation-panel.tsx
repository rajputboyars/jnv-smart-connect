"use client";

import { useState } from "react";
import { Plus, LogOut } from "lucide-react";
import {
  useHostelAllocations,
  useAllocateBed,
  useVacateBed,
  useHostelRooms,
} from "@/hooks/use-hostel";
import { StudentPicker, type PickedStudent } from "@/components/shared/student-picker";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { initials, formatDate } from "@/lib/utils";

export function AllocationPanel() {
  const { data: allocations, isLoading } = useHostelAllocations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vacateId, setVacateId] = useState<string | null>(null);
  const vacateMutation = useVacateBed();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Active room allocations.</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> Allocate bed
            </Button>
          </DialogTrigger>
          <AllocateDialog onDone={() => setDialogOpen(false)} />
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Building</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Bed</TableHead>
            <TableHead>Since</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6}>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && allocations?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No active allocations.
              </TableCell>
            </TableRow>
          )}
          {allocations?.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    {a.student.photoUrl ? <AvatarImage src={a.student.photoUrl} alt={a.student.name} /> : null}
                    <AvatarFallback className="text-xs">{initials(a.student.name)}</AvatarFallback>
                  </Avatar>
                  {a.student.name}
                </div>
              </TableCell>
              <TableCell>{a.room.building.name}</TableCell>
              <TableCell>{a.room.roomNumber}</TableCell>
              <TableCell>{a.bedNumber}</TableCell>
              <TableCell>{formatDate(a.allocatedAt)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => setVacateId(a.id)}>
                  <LogOut className="size-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={!!vacateId}
        onOpenChange={(open) => !open && setVacateId(null)}
        title="Vacate bed?"
        description="This frees up the bed for another student."
        confirmLabel="Vacate"
        destructive
        loading={vacateMutation.isPending}
        onConfirm={() => {
          if (vacateId) vacateMutation.mutate(vacateId, { onSuccess: () => setVacateId(null) });
        }}
      />
    </div>
  );
}

function AllocateDialog({ onDone }: { onDone: () => void }) {
  const { data: rooms = [] } = useHostelRooms();
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const [roomId, setRoomId] = useState("");
  const [bedNumber, setBedNumber] = useState("1");
  const allocateMutation = useAllocateBed();

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const bedOptions = selectedRoom ? Array.from({ length: selectedRoom.bedCount }, (_, i) => i + 1) : [];

  function handleSubmit() {
    if (!student || !roomId) return;
    allocateMutation.mutate(
      { student: student.id, room: roomId, bedNumber: Number(bedNumber) },
      {
        onSuccess: () => {
          onDone();
          setStudent(null);
          setRoomId("");
        },
      }
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Allocate a bed</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <StudentPicker value={student} onChange={setStudent} />
        <Select value={roomId} onValueChange={setRoomId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.building?.name} - Room {r.roomNumber} ({r.occupied}/{r.bedCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={bedNumber} onValueChange={setBedNumber} disabled={!bedOptions.length}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Bed number" />
          </SelectTrigger>
          <SelectContent>
            {bedOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                Bed {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} loading={allocateMutation.isPending} disabled={!student || !roomId}>
          Allocate
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
