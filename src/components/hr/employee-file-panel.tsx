"use client";

import { useState } from "react";
import { Plus, Trash2, FileUp, Award, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { useTeacherOptions } from "@/hooks/use-teachers";
import { useAcademicYears } from "@/hooks/use-academics";
import {
  useEmployeeFile,
  useMyEmployeeFile,
  useCreatePromotionHistory,
  useCreateEmployeeDocument,
  useDeleteEmployeeDocument,
  useCreatePerformanceReview,
} from "@/hooks/use-hr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { formatDate, initials } from "@/lib/utils";
import { requestUploadSignature, uploadToCloudinary } from "@/services/upload.service";
import { ApiClientError } from "@/lib/api-client";
import { toast } from "sonner";
import type { EmployeeDocumentType } from "@/models/enums";

const DOCUMENT_TYPES: { value: EmployeeDocumentType; label: string }[] = [
  { value: "resume", label: "Resume" },
  { value: "id_proof", label: "ID proof" },
  { value: "certificate", label: "Certificate" },
  { value: "contract", label: "Contract" },
  { value: "other", label: "Other" },
];

function PromotionDialog({ teacherId, onDone }: { teacherId: string; onDone: () => void }) {
  const [fromDesignation, setFromDesignation] = useState("");
  const [toDesignation, setToDesignation] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const mutation = useCreatePromotionHistory();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Record promotion</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>From designation</Label>
            <Input value={fromDesignation} onChange={(e) => setFromDesignation(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>To designation</Label>
            <Input value={toDesignation} onChange={(e) => setToDesignation(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Effective date</Label>
          <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Remarks</Label>
          <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!fromDesignation.trim() || !toDesignation.trim() || !effectiveDate}
          onClick={() =>
            mutation.mutate(
              { teacher: teacherId, fromDesignation, toDesignation, effectiveDate, remarks },
              {
                onSuccess: () => {
                  onDone();
                  setFromDesignation("");
                  setToDesignation("");
                  setEffectiveDate("");
                  setRemarks("");
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

function DocumentDialog({ teacherId, onDone }: { teacherId: string; onDone: () => void }) {
  const [docType, setDocType] = useState<EmployeeDocumentType>("resume");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const mutation = useCreateEmployeeDocument();

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const params = await requestUploadSignature("documents");
      const url = await uploadToCloudinary(file, params);
      setFileUrl(url);
      setFileName(file.name);
      toast.success("File uploaded");
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 400) {
        toast.error("Uploads aren't configured for this deployment — paste a file URL instead");
      } else {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload document</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Document type</Label>
          <Select value={docType} onValueChange={(v) => setDocType(v as EmployeeDocumentType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>File</Label>
          <div className="flex gap-2">
            <Input placeholder="File name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
            <Button type="button" variant="outline" size="icon" loading={uploading} asChild>
              <label className="cursor-pointer">
                <FileUp className="size-4" />
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>
            </Button>
          </div>
          <Input placeholder="Or paste a file URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!fileUrl.trim() || !fileName.trim()}
          onClick={() =>
            mutation.mutate(
              { teacher: teacherId, docType, fileUrl, fileName },
              {
                onSuccess: () => {
                  onDone();
                  setFileUrl("");
                  setFileName("");
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

function ReviewDialog({ teacherId, onDone }: { teacherId: string; onDone: () => void }) {
  const { data: academicYears = [] } = useAcademicYears();
  const [academicYear, setAcademicYear] = useState("");
  const [rating, setRating] = useState("3");
  const [strengths, setStrengths] = useState("");
  const [areasOfImprovement, setAreasOfImprovement] = useState("");
  const [goals, setGoals] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const mutation = useCreatePerformanceReview();

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Add performance review</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Academic year</Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Rating (1-5)</Label>
            <Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Review date</Label>
          <Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Strengths</Label>
          <Textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label>Areas of improvement</Label>
          <Textarea value={areasOfImprovement} onChange={(e) => setAreasOfImprovement(e.target.value)} rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label>Goals</Label>
          <Textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={2} />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={mutation.isPending}
          disabled={!academicYear || !reviewDate}
          onClick={() =>
            mutation.mutate(
              {
                teacher: teacherId,
                academicYear,
                rating: Number(rating),
                strengths,
                areasOfImprovement,
                goals,
                reviewDate,
              },
              {
                onSuccess: () => {
                  onDone();
                  setStrengths("");
                  setAreasOfImprovement("");
                  setGoals("");
                  setReviewDate("");
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

export function EmployeeFilePanel() {
  const { user } = useAuth();
  const canManage = !!user && can(user.role, PERMISSIONS.HR_MANAGE);
  const { data: teacherOptions = [] } = useTeacherOptions();
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const deleteDocMutation = useDeleteEmployeeDocument();

  const managedFileQuery = useEmployeeFile(canManage ? selectedTeacher : "");
  const myFileQuery = useMyEmployeeFile(!canManage);
  const file = canManage ? managedFileQuery.data : myFileQuery.data;
  const isLoading = canManage ? managedFileQuery.isLoading : myFileQuery.isLoading;
  const teacherId = canManage ? selectedTeacher : (file?.teacher._id ?? "");

  return (
    <div className="space-y-6">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Select employee</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Choose a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teacherOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {isLoading && (canManage ? !!selectedTeacher : true) && <Skeleton className="h-64 w-full rounded-xl" />}

      {file && (
        <>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Avatar className="size-16">
                {file.teacher.photoUrl ? <AvatarImage src={file.teacher.photoUrl} alt={file.teacher.name} /> : null}
                <AvatarFallback>{initials(file.teacher.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">{file.teacher.name}</div>
                <div className="text-sm text-muted-foreground">
                  {file.teacher.designation ?? "—"} · {file.teacher.employeeId} · {file.teacher.experienceYears} yrs
                  experience
                </div>
                <div className="text-xs text-muted-foreground">Joined {formatDate(file.teacher.joiningDate)}</div>
              </div>
              <Badge className="ml-auto" variant={file.teacher.status === "active" ? "success" : "outline"}>
                {file.teacher.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-4" /> Promotion history
              </CardTitle>
              {canManage && (
                <Dialog open={promotionOpen} onOpenChange={setPromotionOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="size-4" /> Add
                    </Button>
                  </DialogTrigger>
                  <PromotionDialog teacherId={selectedTeacher} onDone={() => setPromotionOpen(false)} />
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Approved by</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {file.promotions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                        No promotions recorded.
                      </TableCell>
                    </TableRow>
                  )}
                  {file.promotions.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>{formatDate(p.effectiveDate)}</TableCell>
                      <TableCell>{p.fromDesignation}</TableCell>
                      <TableCell>{p.toDesignation}</TableCell>
                      <TableCell>{p.approvedBy.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Documents</CardTitle>
              <Dialog open={documentOpen} onOpenChange={setDocumentOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="size-4" /> Upload
                  </Button>
                </DialogTrigger>
                <DocumentDialog teacherId={teacherId} onDone={() => setDocumentOpen(false)} />
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Uploaded by</TableHead>
                    <TableHead>Date</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {file.documents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canManage ? 5 : 4} className="py-6 text-center text-muted-foreground">
                        No documents uploaded.
                      </TableCell>
                    </TableRow>
                  )}
                  {file.documents.map((d) => (
                    <TableRow key={d._id}>
                      <TableCell className="capitalize">{d.docType.replace("_", " ")}</TableCell>
                      <TableCell>
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          {d.fileName}
                        </a>
                      </TableCell>
                      <TableCell>{d.uploadedBy.name}</TableCell>
                      <TableCell>{formatDate(d.createdAt)}</TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            loading={deleteDocMutation.isPending}
                            onClick={() => deleteDocMutation.mutate(d._id)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Award className="size-4" /> Performance reviews
              </CardTitle>
              {canManage && (
                <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="size-4" /> Add
                    </Button>
                  </DialogTrigger>
                  <ReviewDialog teacherId={selectedTeacher} onDone={() => setReviewOpen(false)} />
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reviewed by</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {file.reviews.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                        No performance reviews yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {file.reviews.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>{r.academicYear.name}</TableCell>
                      <TableCell>{r.rating} / 5</TableCell>
                      <TableCell>{r.reviewedBy.name}</TableCell>
                      <TableCell>{formatDate(r.reviewDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
