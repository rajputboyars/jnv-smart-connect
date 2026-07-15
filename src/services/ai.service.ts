import { apiFetch } from "@/lib/api-client";
import type {
  HomeworkGeneratorInput,
  QuestionPaperInput,
} from "@/validators/ai.validator";

export interface RiskFactor {
  label: string;
  contribution: number;
}

export interface StudentRiskScore {
  studentId: string;
  name: string;
  admissionNumber: string;
  className?: string;
  section?: string;
  score: number;
  level: "low" | "moderate" | "high";
  factors: RiskFactor[];
}

export async function fetchParentSummary(studentId: string) {
  const res = await apiFetch<{ studentId: string; summary: string }>("/api/ai/parent-summary", {
    method: "POST",
    body: JSON.stringify({ studentId }),
  });
  return res.data!;
}

export async function fetchReportCardNarrative(studentId: string, highlights: string) {
  const res = await apiFetch<{ studentId: string; narrative: string }>("/api/ai/report-card-narrative", {
    method: "POST",
    body: JSON.stringify({ studentId, highlights }),
  });
  return res.data!;
}

export async function fetchHomework(input: HomeworkGeneratorInput) {
  const res = await apiFetch<{ homework: string }>("/api/ai/homework", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data!;
}

export async function fetchQuestionPaper(input: QuestionPaperInput) {
  const res = await apiFetch<{ paper: string }>("/api/ai/question-paper", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data!;
}

export async function sendChatMessage(message: string, history: { role: "user" | "assistant"; content: string }[]) {
  const res = await apiFetch<{ reply: string }>("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
  return res.data!;
}

export async function fetchRiskScores() {
  const res = await apiFetch<StudentRiskScore[]>("/api/ai/risk-scores");
  return res.data ?? [];
}
