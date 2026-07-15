"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchParentSummary,
  fetchReportCardNarrative,
  fetchHomework,
  fetchQuestionPaper,
  sendChatMessage,
  fetchRiskScores,
} from "@/services/ai.service";
import { ApiClientError } from "@/lib/api-client";
import type { HomeworkGeneratorInput, QuestionPaperInput } from "@/validators/ai.validator";

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

export function useParentSummary() {
  return useMutation({ mutationFn: fetchParentSummary, onError: handleError });
}

export function useReportCardNarrative() {
  return useMutation({
    mutationFn: ({ studentId, highlights }: { studentId: string; highlights: string }) =>
      fetchReportCardNarrative(studentId, highlights),
    onError: handleError,
  });
}

export function useHomeworkGenerator() {
  return useMutation({
    mutationFn: (input: HomeworkGeneratorInput) => fetchHomework(input),
    onError: handleError,
  });
}

export function useQuestionPaperGenerator() {
  return useMutation({
    mutationFn: (input: QuestionPaperInput) => fetchQuestionPaper(input),
    onError: handleError,
  });
}

export function useAiChat() {
  return useMutation({
    mutationFn: ({ message, history }: { message: string; history: { role: "user" | "assistant"; content: string }[] }) =>
      sendChatMessage(message, history),
    onError: handleError,
  });
}

export function useRiskScores() {
  return useQuery({ queryKey: ["ai", "risk-scores"], queryFn: fetchRiskScores });
}
