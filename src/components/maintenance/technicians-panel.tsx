"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTechnicians, useCreateTechnician } from "@/hooks/use-maintenance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MaintenanceCategory } from "@/models/enums";

const CATEGORIES: { value: MaintenanceCategory; label: string }[] = [
  { value: "electrical", label: "Electrical" },
  { value: "furniture", label: "Furniture" },
  { value: "cleaning", label: "Cleaning" },
  { value: "water", label: "Water" },
  { value: "internet", label: "Internet" },
  { value: "building_repair", label: "Building repair" },
  { value: "other", label: "Other" },
];

function NewTechnicianDialog({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState<MaintenanceCategory>("electrical");
  const mutation = useCreateTechnician();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add technician</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email (optional)</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Specialization</Label>
          <Select value={specialization} onValueChange={(v) => setSpecialization(v as MaintenanceCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!name.trim() || !phone.trim()}
          onClick={() =>
            mutation.mutate(
              { name, phone, email, specialization },
              {
                onSuccess: () => {
                  onDone();
                  setName("");
                  setPhone("");
                  setEmail("");
                },
              }
            )
          }
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function TechniciansPanel() {
  const { data: technicians = [], isLoading } = useTechnicians();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Technicians</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> Add technician
            </Button>
          </DialogTrigger>
          <NewTechnicianDialog onDone={() => setDialogOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Specialization</TableHead>
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
            {!isLoading && technicians.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No technicians added yet.
                </TableCell>
              </TableRow>
            )}
            {technicians.map((t) => (
              <TableRow key={t._id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.phone}</TableCell>
                <TableCell>{t.email ?? "—"}</TableCell>
                <TableCell className="capitalize">{t.specialization.replace("_", " ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
