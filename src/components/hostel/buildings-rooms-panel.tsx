"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Building2 } from "lucide-react";
import {
  createHostelBuildingSchema,
  type CreateHostelBuildingInput,
  createHostelRoomSchema,
  type CreateHostelRoomInput,
} from "@/validators/hostel.validator";
import {
  useHostelBuildings,
  useCreateHostelBuilding,
  useDeleteHostelBuilding,
  useHostelRooms,
  useCreateHostelRoom,
  useDeleteHostelRoom,
} from "@/hooks/use-hostel";
import { useTeacherOptions } from "@/hooks/use-teachers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function BuildingsRoomsPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <BuildingsCard />
      <RoomsCard />
    </div>
  );
}

function BuildingsCard() {
  const { data: buildings, isLoading } = useHostelBuildings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteHostelBuilding();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-4" /> Buildings
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> New
            </Button>
          </DialogTrigger>
          <BuildingDialog onDone={() => setDialogOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <Skeleton className="h-32 w-full" />}
        {!isLoading && buildings?.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No buildings yet.</p>
        )}
        {buildings?.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="font-medium">
                {b.name} <span className="text-xs text-muted-foreground">({b.code})</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {b.gender} &middot; {b.roomCount} rooms &middot; {b.bedCount} beds
                {b.warden ? ` · Warden: ${b.warden.name}` : ""}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDeleteId(b.id)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </CardContent>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove building?"
        description="You can only remove a building with no rooms."
        confirmLabel="Remove"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
      />
    </Card>
  );
}

function BuildingDialog({ onDone }: { onDone: () => void }) {
  const { data: teachers = [] } = useTeacherOptions();
  const createMutation = useCreateHostelBuilding();

  const form = useForm<CreateHostelBuildingInput>({
    resolver: zodResolver(createHostelBuildingSchema),
    defaultValues: { name: "", code: "", gender: "boys", warden: "", totalFloors: 1 },
  });

  function onSubmit(values: CreateHostelBuildingInput) {
    createMutation.mutate(values, {
      onSuccess: () => {
        onDone();
        form.reset();
      },
    });
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New hostel building</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="HB-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalFloors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floors</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Residents</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="boys">Boys</SelectItem>
                    <SelectItem value="girls">Girls</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="warden"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warden (optional)</FormLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" loading={createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

function RoomsCard() {
  const { data: rooms, isLoading } = useHostelRooms();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteHostelRoom();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Rooms</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> New
            </Button>
          </DialogTrigger>
          <RoomDialog onDone={() => setDialogOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Building</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Beds</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rooms?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No rooms yet.
                </TableCell>
              </TableRow>
            )}
            {rooms?.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.building?.name}</TableCell>
                <TableCell>{r.roomNumber}</TableCell>
                <TableCell>
                  <Badge variant={r.occupied >= r.bedCount ? "warning" : "secondary"}>
                    {r.occupied}/{r.bedCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove room?"
        description="You can only remove a room with no active occupants."
        confirmLabel="Remove"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
      />
    </Card>
  );
}

function RoomDialog({ onDone }: { onDone: () => void }) {
  const { data: buildings = [] } = useHostelBuildings();
  const createMutation = useCreateHostelRoom();

  const form = useForm<CreateHostelRoomInput>({
    resolver: zodResolver(createHostelRoomSchema),
    defaultValues: { building: "", roomNumber: "", floor: 0, bedCount: 4 },
  });

  function onSubmit(values: CreateHostelRoomInput) {
    createMutation.mutate(values, {
      onSuccess: () => {
        onDone();
        form.reset();
      },
    });
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New room</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="building"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room no.</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor</FormLabel>
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
              name="bedCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beds</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" loading={createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
