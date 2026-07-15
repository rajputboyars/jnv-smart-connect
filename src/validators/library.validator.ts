import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createBookSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  author: z.string().trim().min(1, "Author is required"),
  isbn: z.string().trim().optional().or(z.literal("")),
  category: z.string().trim().min(1, "Category is required"),
  publisher: z.string().trim().optional().or(z.literal("")),
  accessionNumber: z.string().trim().min(1, "Accession number is required"),
  totalCopies: z.number().min(1).max(500),
  coverUrl: z.string().trim().optional().or(z.literal("")),
});
export type CreateBookInput = z.infer<typeof createBookSchema>;
export const updateBookSchema = createBookSchema.partial();
export type UpdateBookInput = z.infer<typeof updateBookSchema>;

export const bookQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional().default(""),
});
export type BookQueryInput = z.infer<typeof bookQuerySchema>;

export const issueBookSchema = z.object({
  book: objectId,
  student: objectId,
  dueDate: z.string().min(1, "Due date is required"),
});
export type IssueBookInput = z.infer<typeof issueBookSchema>;

export const returnBookSchema = z.object({
  finePaid: z.boolean(),
});
export type ReturnBookInput = z.infer<typeof returnBookSchema>;
