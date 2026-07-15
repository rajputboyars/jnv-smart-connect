export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  details?: unknown;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const json = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!res.ok || json.success === false) {
    throw new ApiClientError(json.message ?? "Something went wrong", res.status, json.details);
  }

  return json;
}
