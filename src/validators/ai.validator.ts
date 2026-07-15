import { z } from "zod";

export const parentSummarySchema = z.object({
  studentId: z.string().min(1, "Student is required"),
});
export type ParentSummaryInput = z.infer<typeof parentSummarySchema>;

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const homeworkGeneratorSchema = z.object({
  subject: z.string().trim().min(2, "Subject is required"),
  topic: z.string().trim().min(2, "Topic is required"),
  className: z.string().trim().min(1, "Class is required"),
  difficulty: z.enum(DIFFICULTIES),
  questionCount: z.number().int().min(1).max(20),
});
export type HomeworkGeneratorInput = z.infer<typeof homeworkGeneratorSchema>;

export const questionPaperSchema = z.object({
  subject: z.string().trim().min(2, "Subject is required"),
  topic: z.string().trim().min(2, "Topic is required"),
  className: z.string().trim().min(1, "Class is required"),
  difficulty: z.enum(DIFFICULTIES),
  questionCount: z.number().int().min(1).max(30),
  totalMarks: z.number().int().min(5).max(200),
});
export type QuestionPaperInput = z.infer<typeof questionPaperSchema>;

export const reportCardNarrativeSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  highlights: z.string().trim().max(1000).optional(),
});
export type ReportCardNarrativeInput = z.infer<typeof reportCardNarrativeSchema>;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const chatSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(2000),
  history: z.array(chatMessageSchema).max(20).optional(),
});
export type ChatInput = z.infer<typeof chatSchema>;
