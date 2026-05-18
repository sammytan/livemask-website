/**
 * Unified HTTP Client layer — TASK-WEBSITE-HTTP-CLIENT-001
 *
 * All API calls must go through rawFetch / publicFetch / authFetch.
 * No business API file should call fetch() directly.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const DEFAULT_TIMEOUT_MS = 15_000;

// ── Error types ──────────────────────────────────────────────────────────

/** Structured HTTP error from the Backend or from this client. */
export interface HttpErrorBody {
  code: string;
  message: string;
  status: number;
  isUnauthorized: boolean;
  isForbidden: boolean;
  isNetworkError: boolean;
}

/**
 * Parse a Backend error body into a standard { code, message } shape.
 * Backend may respond with either:
 *   { "error": { "code": "...", "message": "..." } }
 * or:
 *   { "code": "...", "message": "..." }
 */
function parseErrorBody(body: unknown): { code: string; message: string } {
  const flat = (body as Record<string, unknown>)?.error ?? body ?? {};
  const rec = flat as Record<string, unknown>;
  return {
    code: typeof rec.code === "string" ? rec.code : "UNKNOWN",
    message:
      typeof rec.message === "string"
        ? rec.message
        : "An unexpected error occurred.",
  };
}

/** Build a structured HttpErrorBody from a fetch Response or error. */
function toHttpError(
  status: number,
  code: string,
  message: string,
): HttpErrorBody {
  return {
    status,
    code,
    message,
    get isUnauthorized() {
      return this.status === 401;
    },
    get isForbidden() {
      return this.status === 403;
    },
    get isNetworkError() {
      return this.code === "NETWORK_ERROR";
    },
  };
}

// ── rawFetch ─────────────────────────────────────────────────────────────

/**
 * Low-level fetch wrapper.
 *
 * - 15 s timeout (AbortController)
 * - Content-Type: application/json, Accept: application/json
 * - Parses JSON response
 * - Non-2xx → throws HttpErrorBody
 * - Network / abort → throws HttpErrorBody with code NETWORK_ERROR
 * - No token / auth handling
 */
export async function rawFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const err = parseErrorBody(body);
      throw toHttpError(response.status, err.code, err.message);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw toHttpError(0, "NETWORK_ERROR", "Request timed out.");
    }
    if ((err as HttpErrorBody)?.status !== undefined) {
      throw err; // re-throw structured errors
    }
    // Network error (fetch failed entirely)
    throw toHttpError(0, "NETWORK_ERROR", "Network error. Please check your connection.");
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── publicFetch ──────────────────────────────────────────────────────────

/**
 * Fetch for public / SEO / marketing endpoints.
 *
 * - Uses rawFetch
 * - No Authorization header
 * - No token / refresh logic
 */
export async function publicFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return rawFetch<T>(`${API_BASE}${path}`, options);
}

// ── Auth token provider (lazy registration to avoid circular deps) ───────

export interface AuthTokenProvider {
  getAccessToken: () => string | null;
  tryRefreshTokens: () => Promise<boolean>;
}

let _tokenProvider: AuthTokenProvider | null = null;

/**
 * Register the auth token provider from the AuthApiClient singleton.
 * Called once at module init in api.ts to avoid circular imports.
 */
export function configureAuthProvider(provider: AuthTokenProvider): void;
export function configureAuthProvider(
  getAccessToken: () => string | null,
  tryRefreshTokens: () => Promise<boolean>,
): void;
export function configureAuthProvider(
  providerOrGet: AuthTokenProvider | (() => string | null),
  tryRefreshTokens?: () => Promise<boolean>,
): void {
  if (typeof providerOrGet === "object" && providerOrGet !== null) {
    _tokenProvider = providerOrGet;
  } else {
    _tokenProvider = {
      getAccessToken: providerOrGet as () => string | null,
      tryRefreshTokens: tryRefreshTokens!,
    };
  }
}

// ── authFetch ────────────────────────────────────────────────────────────

/**
 * Fetch for protected / authenticated endpoints.
 *
 * - Uses rawFetch
 * - Automatically adds Authorization: Bearer <access_token>
 * - On 401 AUTH_TOKEN_EXPIRED → refresh → retry once
 * - Refresh failure → throws AUTH_SESSION_EXPIRED
 * - Does NOT log / leak token to console / query string
 */
export async function authFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const provider = _tokenProvider;
  const accessToken = provider?.getAccessToken() ?? null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const url = `${API_BASE}${path}`;

  try {
    return await rawFetch<T>(url, { ...options, headers });
  } catch (err: unknown) {
    const httpErr = err as HttpErrorBody;

    // Only attempt refresh on 401 AUTH_TOKEN_EXPIRED
    if (
      httpErr.isUnauthorized &&
      httpErr.code === "AUTH_TOKEN_EXPIRED" &&
      provider
    ) {
      const refreshed = await provider.tryRefreshTokens();
      if (refreshed) {
        // Retry original request with fresh token
        const newToken = provider.getAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
        }
        return rawFetch<T>(url, { ...options, headers });
      }

      // Refresh failed — session expired
      throw toHttpError(401, "AUTH_SESSION_EXPIRED", "Session expired. Please login again.");
    }

    throw httpErr;
  }
}
