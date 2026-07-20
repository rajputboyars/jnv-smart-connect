"use client";

import { useState } from "react";
import { Plus, Wrench, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import {
  useMaintenanceTickets,
  useCreateMaintenanceTicket,
  useAssignTechnician,
  useUpdateTicketStatus,
  useTechnicians,
} from "@/hooks/use-maintenance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from "@/models/enums";
import type { MaintenanceTicketItem } from "@/services/maintenance.service";

const CATEGORIES: { value: MaintenanceCategory; label: string }[] = [
  { value: "electrical", label: "Electrical" },
  { value: "furniture", label: "Furniture" },
  { value: "cleaning", label: "Cleaning" },
  { value: "water", label: "Water" },
  { value: "internet", label: "Internet" },
  { value: "building_repair", label: "Building repair" },
  { value: "other", label: "Other" },
];

const PRIORITIES: { value: MaintenancePriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const NEXT_STATUSES: MaintenanceStatus[] = ["open", "assigned", "in_progress", "resolved", "closed"];

function priorityVariant(p: MaintenancePriority): "outline" | "warning" | "destructive" {
  if (p === "urgent" || p === "high") return "destructive";
  if (p === "medium") return "warning";
  return "outline";
}

function statusVariant(s: MaintenanceStatus): "outline" | "warning" | "success" {
  if (s === "resolved" || s === "closed") return "success";
  if (s === "open") return "outline";
  return "warning";
}

function NewTicketDialog({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MaintenanceCategory>("other");
  const [priority, setPriority] = useState<MaintenancePriority>("medium");
  const [location, setLocation] = useState("");
  const mutation = useCreateMaintenanceTicket();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Raise a complaint ticket</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fan not working in Room 12" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MaintenanceCategory)}>
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
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as MaintenancePriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Hostel Block A, Room 12" />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!title.trim() || !description.trim() || !location.trim()}
          onClick={() =>
            mutation.mutate(
              { title, description, category, priority, location },
              {
                onSuccess: () => {
                  onDone();
                  setTitle("");
                  setDescription("");
                  setLocation("");
                },
              }
            )
          }
        >
          Submit ticket
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function AssignDialog({ ticket, onDone }: { ticket: MaintenanceTicketItem; onDone: () => void }) {
  // List every active technician (not just exact-specialization matches) so no
  // ticket is un-assignable; those matching the ticket's category are floated
  // to the top and their specialization is shown for guidance.
  const { data: allTechnicians = [] } = useTechnicians();
  const technicians = [...allTechnicians].sort((a, b) => {
    const aMatch = a.specialization === ticket.category ? 0 : 1;
    const bMatch = b.specialization === ticket.category ? 0 : 1;
    return aMatch - bMatch || a.name.localeCompare(b.name);
  });
  const [technician, setTechnician] = useState("");
  const mutation = useAssignTechnician();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Assign technician</DialogTitle>
      </DialogHeader>
      <Select value={technician} onValueChange={setTechnician}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a technician" />
        </SelectTrigger>
        <SelectContent>
          {technicians.map((t) => (
            <SelectItem key={t._id} value={t._id}>
              {t.name} · {t.specialization.replace("_", " ")} · {t.phone}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!technician}
          onClick={() => mutation.mutate({ id: ticket._id, technician }, { onSuccess: onDone })}
        >
          Assign
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function TimelineDialog({ ticket }: { ticket: MaintenanceTicketItem }) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{ticket.title}</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">{ticket.description}</p>
      <div className="space-y-3 border-l pl-4">
        {ticket.timeline.map((entry, idx) => (
          <div key={idx} className="text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(entry.status)}>{entry.status.replace("_", " ")}</Badge>
              <span className="text-xs text-muted-foreground">{formatDate(entry.at)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {entry.by.name}
              {entry.note ? ` — ${entry.note}` : ""}
            </div>
          </div>
        ))}
      </div>
    </DialogContent>
  );
}

export function TicketsPanel() {
  const { user } = useAuth();
  const canManage = !!user && can(user.role, PERMISSIONS.MAINTENANCE_MANAGE);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data: tickets = [], isLoading } = useMaintenanceTickets({ status: statusFilter || undefined });
  const statusMutation = useUpdateTicketStatus();
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [assignTicket, setAssignTicket] = useState<MaintenanceTicketItem | null>(null);
  const [timelineTicket, setTimelineTicket] = useState<MaintenanceTicketItem | null>(null);

  const colSpan = canManage ? 7 : 6;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{canManage ? "Maintenance tickets" : "My tickets"}</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {NEXT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> New ticket
              </Button>
            </DialogTrigger>
            <NewTicketDialog onDone={() => setNewDialogOpen(false)} />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Technician</TableHead>
              {canManage && <TableHead>Raised by</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={colSpan}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                  No tickets yet.
                </TableCell>
              </TableRow>
            )}
            {tickets.map((t) => (
              <TableRow key={t._id}>
                <TableCell className="font-medium">
                  <button className="hover:underline" onClick={() => setTimelineTicket(t)}>
                    {t.title}
                  </button>
                  <div className="text-xs text-muted-foreground">{t.location}</div>
                </TableCell>
                <TableCell className="capitalize">{t.category.replace("_", " ")}</TableCell>
                <TableCell>
                  <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(t.status)}>{t.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>{t.assignedTechnician?.name ?? "—"}</TableCell>
                {canManage && <TableCell>{t.raisedBy.name}</TableCell>}
                <TableCell className="text-right">
                  {canManage && (
                    <div className="flex justify-end gap-1">
                      {!t.assignedTechnician && (
                        <Button variant="outline" size="sm" onClick={() => setAssignTicket(t)}>
                          <Wrench className="size-4" /> Assign
                        </Button>
                      )}
                      {t.status !== "resolved" && t.status !== "closed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ id: t._id, status: "resolved" })}
                        >
                          <Check className="size-4" /> Resolve
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!assignTicket} onOpenChange={(open) => !open && setAssignTicket(null)}>
        {assignTicket && <AssignDialog ticket={assignTicket} onDone={() => setAssignTicket(null)} />}
      </Dialog>
      <Dialog open={!!timelineTicket} onOpenChange={(open) => !open && setTimelineTicket(null)}>
        {timelineTicket && <TimelineDialog ticket={timelineTicket} />}
      </Dialog>
    </Card>
  );
}
