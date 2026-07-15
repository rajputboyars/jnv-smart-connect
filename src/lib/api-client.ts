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

const REFRESH_URL = "/api/auth/refresh";
const NO_REFRESH_RETRY_URLS = new Set([REFRESH_URL, "/api/auth/login", "/api/auth/logout"]);

// Access tokens are short-lived (15 min). Rather than pre-emptively refresh
// on a timer, we let one fail with 401 and transparently refresh + retry
// once — the common "silent refresh" pattern for cookie-based sessions. The
// in-flight promise is shared so concurrent 401s only trigger one refresh
// call instead of a stampede.
let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(REFRESH_URL, { method: "POST" })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function doFetch<T>(input: string, init?: RequestInit): Promise<{ res: Response; json: ApiEnvelope<T> }> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const json = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;
  return { res, json };
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  let { res, json } = await doFetch<T>(input, init);

  if (res.status === 401 && !NO_REFRESH_RETRY_URLS.has(input)) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      ({ res, json } = await doFetch<T>(input, init));
    }
  }

  if (!res.ok || json.success === false) {
    throw new ApiClientError(json.message ?? "Something went wrong", res.status, json.details);
  }

  return json;
}
