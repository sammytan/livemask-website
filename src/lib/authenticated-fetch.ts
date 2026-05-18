import type { ApiError } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Lazy auth provider registration — avoids circular module dependency.
// api.ts calls configureAuthProvider() at module init so authenticatedFetch
// can read the current access token and trigger refresh without importing
// the authClient singleton directly.
let _getAccessToken: () => string | null = () => null;
let _tryRefreshTokens: () => Promise<boolean> = async () => false;

export function configureAuthProvider(
  getAccessToken: () => string | null,
  tryRefreshTokens: () => Promise<boolean>,
) {
  _getAccessToken = getAccessToken;
  _tryRefreshTokens = tryRefreshTokens;
}

/**
 * Parse a Backend error body into a standard { code, message } shape.
 *
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
    message: typeof rec.message === "string" ? rec.message : "An unexpected error occurred.",
  };
}

/**
 * Unified authenticated fetch for protected API endpoints.
 *
 * Features:
 * - Automatically attaches `Authorization: Bearer <access_token>`
 * - On 401 → calls refresh token flow, then retries the original request once
 * - Refresh failure → throws structured ApiError with code AUTH_REFRESH_REVOKED
 * - Parses Backend error format `{ error: { code, message } }`
 * - Does NOT print tokens to console / logs
 * - Does NOT put tokens in URL query strings
 *
 * @param path  API path (e.g. "/api/v1/nodes")
 * @param options  Standard fetch RequestInit (Content-Type defaults to application/json)
 * @returns Parsed JSON response body
 */
export async function authenticatedFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = _getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const url = `${API_BASE}${path}`;

  // SECURITY: Do not log accessToken / refreshToken.
  // SECURITY: Do not append tokens as query parameters.

  const response = await fetch(url, { ...options, headers });

  // ── 401 handling with token refresh ──────────────────────────────────
  if (response.status === 401) {
    const body = await response.json().catch(() => ({}));
    const err = parseErrorBody(body);

    if (err.code === "AUTH_TOKEN_EXPIRED") {
      const refreshed = await _tryRefreshTokens();
      if (refreshed) {
        // Retry original request with fresh token
        const newToken = _getAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
        }
        const retryRes = await fetch(url, { ...options, headers });
        if (!retryRes.ok) {
          const retryBody = await retryRes.json().catch(() => ({}));
          const retryErr = parseErrorBody(retryBody);
          const apiError: ApiError = {
            status: retryRes.status,
            code: retryErr.code,
            message: retryErr.message,
          };
          throw apiError;
        }
        return retryRes.json() as Promise<T>;
      }
      // Refresh failed — session expired
      const apiError: ApiError = {
        status: 401,
        code: "AUTH_REFRESH_REVOKED",
        message: "Session expired. Please login again.",
      };
      throw apiError;
    }

    throw { status: 401, code: err.code, message: err.message } as ApiError;
  }

  // ── Non-401 error responses ──────────────────────────────────────────
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const err = parseErrorBody(body);
    throw { status: response.status, code: err.code, message: err.message } as ApiError;
  }

  return response.json() as Promise<T>;
}
