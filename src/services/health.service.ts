import { apiFetch } from "@/lib/api-client";
import type { MedicineRoute } from "@/models/enums";

export interface MedicalReport {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    bloodGroup?: string;
    photoUrl?: string;
    medicalInfo?: {
      conditions?: string;
      allergies?: string;
      medications?: string;
      doctorName?: string;
      doctorPhone?: string;
    };
    emergencyContact?: { name: string; relation: string; phone: string };
  };
  medicines: {
    id: string;
    medicineName: string;
    dosage: string;
    route: MedicineRoute;
    givenAt: string;
    givenBy?: { name: string };
    notes?: string;
  }[];
  visits: {
    id: string;
    visitDate: string;
    reason: string;
    diagnosis?: string;
    prescription?: string;
    doctorName: string;
    followUpDate?: string;
  }[];
}

export async function fetchMedicalReport(studentId?: string) {
  const params = studentId ? `?studentId=${studentId}` : "";
  const res = await apiFetch<MedicalReport>(`/api/health/medical-report${params}`);
  return res.data as MedicalReport;
}

export async function createMedicineLogRequest(input: {
  student: string;
  medicineName: string;
  dosage: string;
  route: MedicineRoute;
  notes?: string;
}) {
  const res = await apiFetch<{ id: string }>("/api/health/medicine-logs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function createDoctorVisitRequest(input: {
  student: string;
  reason: string;
  diagnosis?: string;
  prescription?: string;
  doctorName: string;
  followUpDate?: string;
  notifyParent: boolean;
}) {
  const res = await apiFetch<{ id: string }>("/api/health/doctor-visits", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}
