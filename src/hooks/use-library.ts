"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchBooks,
  createBookRequest,
  updateBookRequest,
  deleteBookRequest,
  fetchBookIssues,
  issueBookRequest,
  returnBookRequest,
  type BookListParams,
  type BookInput,
} from "@/services/library.service";
import { ApiClientError } from "@/lib/api-client";

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

export function useBooks(params: BookListParams) {
  return useQuery({
    queryKey: ["books", params],
    queryFn: () => fetchBooks(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBookRequest,
    onSuccess: () => {
      toast.success("Book added");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: handleError,
  });
}

export function useUpdateBook(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<BookInput>) => updateBookRequest(id, input),
    onSuccess: () => {
      toast.success("Book updated");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: handleError,
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBookRequest,
    onSuccess: () => {
      toast.success("Book removed");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: handleError,
  });
}

export function useBookIssues(status?: string) {
  return useQuery({ queryKey: ["book-issues", status], queryFn: () => fetchBookIssues(status) });
}

export function useIssueBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueBookRequest,
    onSuccess: () => {
      toast.success("Book issued");
      queryClient.invalidateQueries({ queryKey: ["book-issues"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: handleError,
  });
}

export function useReturnBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, finePaid }: { id: string; finePaid: boolean }) => returnBookRequest(id, finePaid),
    onSuccess: (result) => {
      toast.success(result.fineAmount > 0 ? `Returned — fine ₹${result.fineAmount}` : "Book returned");
      queryClient.invalidateQueries({ queryKey: ["book-issues"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: handleError,
  });
}
