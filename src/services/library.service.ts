import { apiFetch } from "@/lib/api-client";
import type { BookIssueStatus } from "@/models/enums";

export interface BookItem {
  _id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  publisher?: string;
  accessionNumber: string;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string;
}

export interface BookInput {
  title: string;
  author: string;
  isbn?: string;
  category: string;
  publisher?: string;
  accessionNumber: string;
  totalCopies: number;
  coverUrl?: string;
}

export interface BookListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function fetchBooks(params: BookListParams) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, String(value));
  });

  const res = await apiFetch<BookItem[]>(`/api/books?${searchParams.toString()}`);
  return { items: res.data ?? [], pagination: res.pagination! };
}

export async function createBookRequest(input: BookInput) {
  const res = await apiFetch<{ id: string }>("/api/books", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function updateBookRequest(id: string, input: Partial<BookInput>) {
  const res = await apiFetch<{ id: string }>(`/api/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function deleteBookRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/books/${id}`, { method: "DELETE" });
}

export interface BookIssueItem {
  id: string;
  book: { _id: string; title: string; accessionNumber: string };
  student: { _id: string; name: string; admissionNumber: string };
  issuedDate: string;
  dueDate: string;
  returnedDate?: string;
  status: BookIssueStatus;
  fineAmount: number;
  finePaid: boolean;
  overdueDays: number;
}

export async function fetchBookIssues(status?: string) {
  const res = await apiFetch<BookIssueItem[]>(`/api/library/issues${status ? `?status=${status}` : ""}`);
  return res.data ?? [];
}

export async function issueBookRequest(input: { book: string; student: string; dueDate: string }) {
  const res = await apiFetch<{ id: string }>("/api/library/issues", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function returnBookRequest(id: string, finePaid: boolean) {
  const res = await apiFetch<{ id: string; fineAmount: number }>(`/api/library/issues/${id}/return`, {
    method: "POST",
    body: JSON.stringify({ finePaid }),
  });
  return res.data as { id: string; fineAmount: number };
}
