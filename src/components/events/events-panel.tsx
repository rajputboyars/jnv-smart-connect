"use client";

import { useState } from "react";
import { Plus, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { useEvents, useCreateEvent } from "@/hooks/use-events";
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
import type { EventType } from "@/models/enums";
import { EventDetailDialog } from "@/components/events/event-detail-dialog";

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "sports", label: "Sports" },
  { value: "annual_day", label: "Annual Day" },
  { value: "ncc", label: "NCC" },
  { value: "scouts", label: "Scouts" },
  { value: "competition", label: "Competition" },
  { value: "exhibition", label: "Exhibition" },
  { value: "other", label: "Other" },
];

function NewEventDialog({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("sports");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const mutation = useCreateEvent();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New event</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Annual Sports Meet 2026" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as EventType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Venue</Label>
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>End date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!title.trim() || !venue.trim() || !startDate || !endDate}
          onClick={() =>
            mutation.mutate(
              { title, type, description, venue, startDate, endDate },
              {
                onSuccess: () => {
                  onDone();
                  setTitle("");
                  setDescription("");
                  setVenue("");
                  setStartDate("");
                  setEndDate("");
                },
              }
            )
          }
        >
          Create event
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function EventsPanel() {
  const { user } = useAuth();
  const canManage = !!user && can(user.role, PERMISSIONS.EVENTS_MANAGE);
  const { data: events = [], isLoading } = useEvents();
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Events</CardTitle>
        {canManage && (
          <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> New event
              </Button>
            </DialogTrigger>
            <NewEventDialog onDone={() => setNewDialogOpen(false)} />
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Organizer</TableHead>
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
            {!isLoading && events.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No events yet.
                </TableCell>
              </TableRow>
            )}
            {events.map((e) => (
              <TableRow key={e._id}>
                <TableCell className="font-medium">{e.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {e.type.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{e.venue}</TableCell>
                <TableCell>
                  {formatDate(e.startDate)} – {formatDate(e.endDate)}
                </TableCell>
                <TableCell>{e.organizer.name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelectedEvent({ id: e._id, title: e.title })}>
                    <Eye className="size-4" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && <EventDetailDialog eventId={selectedEvent.id} eventTitle={selectedEvent.title} canManage={canManage} />}
      </Dialog>
    </Card>
  );
}
