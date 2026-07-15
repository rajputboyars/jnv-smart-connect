"use client";

import { HeartPulse, Pill, Stethoscope } from "lucide-react";
import { useMedicalReport } from "@/hooks/use-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, formatDate } from "@/lib/utils";

export function MedicalReportCard({ studentId }: { studentId?: string }) {
  const { data: report, isLoading } = useMedicalReport(studentId);

  if (isLoading || !report) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-5">
          <Avatar className="size-12">
            {report.student.photoUrl ? (
              <AvatarImage src={report.student.photoUrl} alt={report.student.name} />
            ) : null}
            <AvatarFallback>{initials(report.student.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{report.student.name}</p>
            <p className="text-sm text-muted-foreground">{report.student.admissionNumber}</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            {report.student.bloodGroup && <Badge>{report.student.bloodGroup}</Badge>}
            {report.student.emergencyContact && (
              <Badge variant="outline">
                Emergency: {report.student.emergencyContact.name} ({report.student.emergencyContact.phone})
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {(report.student.medicalInfo?.conditions || report.student.medicalInfo?.allergies) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="size-4" /> Known conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <p>
              <span className="text-muted-foreground">Conditions:</span>{" "}
              {report.student.medicalInfo?.conditions || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Allergies:</span>{" "}
              {report.student.medicalInfo?.allergies || "—"}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="size-4" /> Doctor visits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.visits.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No visits recorded.</p>
          )}
          {report.visits.map((v) => (
            <div key={v.id} className="border-b border-border/60 pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <p className="font-medium">{v.reason}</p>
                <span className="text-xs text-muted-foreground">{formatDate(v.visitDate)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Seen by {v.doctorName}</p>
              {v.diagnosis && <p className="mt-1 text-sm">Diagnosis: {v.diagnosis}</p>}
              {v.prescription && <p className="text-sm">Prescription: {v.prescription}</p>}
              {v.followUpDate && (
                <p className="mt-1 text-xs text-warning">Follow-up: {formatDate(v.followUpDate)}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="size-4" /> Medicine log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.medicines.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No medicines logged.</p>
          )}
          {report.medicines.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
              <div>
                <p className="text-sm font-medium">
                  {m.medicineName} <span className="text-muted-foreground">({m.dosage})</span>
                </p>
                {m.notes && <p className="text-xs text-muted-foreground">{m.notes}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(m.givenAt)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
