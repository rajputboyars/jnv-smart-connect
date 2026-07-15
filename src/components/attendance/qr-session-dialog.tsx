"use client";

import { useState } from "react";
import Image from "next/image";
import { useCreateQrSession } from "@/hooks/use-attendance";
import { useSubjectOptions } from "@/hooks/use-academics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { QrSessionResult } from "@/services/attendance.service";

export function QrSessionDialog({
  open,
  onOpenChange,
  classId,
  sectionId,
  date,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  sectionId: string;
  date: string;
}) {
  const { data: subjects = [] } = useSubjectOptions();
  const [subjectId, setSubjectId] = useState("");
  const [session, setSession] = useState<QrSessionResult | null>(null);
  const createMutation = useCreateQrSession();

  function handleOpenChange(next: boolean) {
    if (!next) setSession(null);
    onOpenChange(next);
  }

  function generate() {
    createMutation.mutate(
      {
        class: classId,
        section: sectionId,
        subject: subjectId || undefined,
        date,
        expiresInMinutes: 15,
      },
      { onSuccess: (result) => setSession(result) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR attendance check-in</DialogTitle>
          <DialogDescription>
            Students scan this code with their phone camera and check in from their own account.
            Valid for 15 minutes.
          </DialogDescription>
        </DialogHeader>

        {!session ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Subject (optional)</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generate} loading={createMutation.isPending} className="w-full">
              Generate QR code
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="overflow-hidden rounded-xl border border-border bg-white p-3">
              <Image src={session.qrDataUrl} alt="Attendance QR code" width={240} height={240} unoptimized />
            </div>
            <p className="text-xs text-muted-foreground">
              Expires at {new Date(session.expiresAt).toLocaleTimeString()}
            </p>
            <p className="break-all text-center text-xs text-muted-foreground">{session.checkinUrl}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
