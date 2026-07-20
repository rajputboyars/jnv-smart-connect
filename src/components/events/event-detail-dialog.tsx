"use client";

import { useState } from "react";
import { Plus, Trash2, Award, Download, ImageIcon } from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import {
  useEventParticipants,
  useAddEventParticipant,
  useEventPhotos,
  useAddEventPhoto,
  useDeleteEventPhoto,
  useCertificates,
  useIssueCertificate,
} from "@/hooks/use-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { EventParticipantRole } from "@/models/enums";

const ROLES: { value: EventParticipantRole; label: string }[] = [
  { value: "participant", label: "Participant" },
  { value: "winner", label: "Winner" },
  { value: "runner_up", label: "Runner-up" },
  { value: "organizer", label: "Organizer" },
];

function ParticipantsTab({ eventId, canManage }: { eventId: string; canManage: boolean }) {
  const { data: participants = [], isLoading } = useEventParticipants(eventId);
  const [search, setSearch] = useState("");
  const { data: searchResults } = useStudents({ page: 1, limit: 10, search });
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState<EventParticipantRole>("participant");
  const [position, setPosition] = useState("");
  const addMutation = useAddEventParticipant(eventId);

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Search student</Label>
            <Input className="w-48" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or admission no." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {(searchResults?.items ?? []).map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name} ({s.admissionNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as EventParticipantRole)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Position (optional)</Label>
            <Input className="w-28" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="1st" />
          </div>
          <Button
            size="sm"
            loading={addMutation.isPending}
            disabled={!studentId}
            onClick={() =>
              addMutation.mutate(
                { student: studentId, role, position },
                { onSuccess: () => { setStudentId(""); setPosition(""); setSearch(""); } }
              )
            }
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Position</TableHead>
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
          {!isLoading && participants.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                No participants recorded yet.
              </TableCell>
            </TableRow>
          )}
          {participants.map((p) => (
            <TableRow key={p._id}>
              <TableCell className="font-medium">
                {p.student.name}
                <div className="text-xs text-muted-foreground">{p.student.admissionNumber}</div>
              </TableCell>
              <TableCell>
                {p.student.currentClass?.name} {p.student.section?.name}
              </TableCell>
              <TableCell className="capitalize">{p.role.replace("_", " ")}</TableCell>
              <TableCell>{p.position ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function GalleryTab({ eventId, canManage }: { eventId: string; canManage: boolean }) {
  const { data: photos = [], isLoading } = useEventPhotos(eventId);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const addMutation = useAddEventPhoto(eventId);
  const deleteMutation = useDeleteEventPhoto(eventId);

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Photo URL</Label>
            <Input className="w-64" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Caption (optional)</Label>
            <Input className="w-48" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <Button
            size="sm"
            loading={addMutation.isPending}
            disabled={!url.trim()}
            onClick={() => addMutation.mutate({ url, caption }, { onSuccess: () => { setUrl(""); setCaption(""); } })}
          >
            <Plus className="size-4" /> Add photo
          </Button>
        </div>
      )}
      {isLoading && <Skeleton className="h-32 w-full" />}
      {!isLoading && photos.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
          <ImageIcon className="size-8" />
          No photos in the gallery yet.
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p) => (
          <div key={p._id} className="group relative overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption ?? "Event photo"} className="h-32 w-full object-cover" />
            {p.caption && <div className="p-1.5 text-xs text-muted-foreground">{p.caption}</div>}
            {canManage && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 size-7 opacity-0 group-hover:opacity-100"
                onClick={() => deleteMutation.mutate(p._id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificatesTab({
  eventId,
  eventTitle,
  canManage,
}: {
  eventId: string;
  eventTitle: string;
  canManage: boolean;
}) {
  const { data: participants = [] } = useEventParticipants(eventId);
  const { data: certificates = [], isLoading } = useCertificates(eventId);
  const [participantId, setParticipantId] = useState("");
  const [title, setTitle] = useState("Certificate of Participation");
  const issueMutation = useIssueCertificate(eventId);

  async function download(
    recipientName: string,
    certTitle: string,
    issuedBy: string,
    date: string,
    schoolName?: string
  ) {
    const { exportCertificatePdf } = await import("@/lib/export/pdf");
    exportCertificatePdf(`certificate-${recipientName.replace(/\s+/g, "-")}`, {
      schoolName: schoolName || "School",
      certificateTitle: certTitle,
      recipientName,
      eventTitle,
      date,
      issuedBy,
    });
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Participant</Label>
            <Select value={participantId} onValueChange={setParticipantId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select participant" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.student.name} ({p.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Certificate title</Label>
            <Input className="w-56" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <Button
            size="sm"
            loading={issueMutation.isPending}
            disabled={!participantId || !title.trim()}
            onClick={() => issueMutation.mutate({ participant: participantId, title })}
          >
            <Award className="size-4" /> Issue certificate
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipient</TableHead>
            <TableHead>Certificate</TableHead>
            <TableHead>Issued by</TableHead>
            <TableHead>Date</TableHead>
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
          {!isLoading && certificates.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                No certificates issued yet.
              </TableCell>
            </TableRow>
          )}
          {certificates.map((c) => (
            <TableRow key={c._id}>
              <TableCell className="font-medium">{c.participant.student.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{c.title}</Badge>
              </TableCell>
              <TableCell>{c.issuedBy.name}</TableCell>
              <TableCell>{formatDate(c.issuedAt)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    download(
                      c.participant.student.name,
                      c.title,
                      c.issuedBy.name,
                      formatDate(c.issuedAt),
                      c.school?.name
                    )
                  }
                >
                  <Download className="size-4" /> Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function EventDetailDialog({
  eventId,
  eventTitle,
  canManage,
}: {
  eventId: string;
  eventTitle: string;
  canManage: boolean;
}) {
  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{eventTitle}</DialogTitle>
      </DialogHeader>
      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>
        <TabsContent value="participants">
          <ParticipantsTab eventId={eventId} canManage={canManage} />
        </TabsContent>
        <TabsContent value="gallery">
          <GalleryTab eventId={eventId} canManage={canManage} />
        </TabsContent>
        <TabsContent value="certificates">
          <CertificatesTab eventId={eventId} eventTitle={eventTitle} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}
