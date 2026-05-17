import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshRequest,
  RefreshResponse,
  User,
  AdminMeResponse,
  ApiError,
  NodePublic,
  NodeListResponse,
  RecommendedNodeResponse,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const MOCK_MODE = import.meta.env.VITE_API_MOCK_MODE !== "false" && import.meta.env.VITE_API_MOCK_MODE !== "0";

const AUTH_ERRORS_MAP: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  AUTH_TOKEN_EXPIRED: "Session expired. Please login again.",
  AUTH_REFRESH_REVOKED: "Session revoked. Please login again.",
  AUTH_EMAIL_NOT_VERIFIED: "Please verify your email before continuing.",
  AUTH_MFA_REQUIRED: "Additional verification required.",
  AUTH_FORBIDDEN: "You do not have permission to perform this action.",
  AUTH_RATE_LIMITED: "Too many attempts. Please try again later.",
  AUTH_WEAK_PASSWORD: "Password does not meet security requirements.",
  AUTH_DUPLICATE_EMAIL: "An account with this email already exists.",
};

function getErrorMessage(error: ApiError): string {
  return AUTH_ERRORS_MAP[error.code] || error.message || "An unexpected error occurred.";
}

class AuthApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private mockMode = MOCK_MODE; // Set VITE_API_MOCK_MODE=false to use real Backend

  setTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    authenticated = false
  ): Promise<T> {
    if (this.mockMode) {
      return this.mockRequest<T>(path, options);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (authenticated && this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const errorBody = await response.json().catch(() => ({}));
      if (errorBody.code === "AUTH_TOKEN_EXPIRED") {
        const refreshed = await this.tryRefresh();
        if (refreshed) {
          headers["Authorization"] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
          });
          if (!retryResponse.ok) {
            const retryError = await retryResponse.json();
            throw { status: retryResponse.status, ...retryError } as ApiError;
          }
          return retryResponse.json();
        }
      }
      throw { status: response.status, ...errorBody } as ApiError;
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({
        code: "UNKNOWN",
        message: response.statusText,
      }));
      throw { status: response.status, ...errorBody } as ApiError;
    }

    return response.json();
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const res = await this.refresh({
          refresh_token: this.refreshToken || undefined,
          client_type: "website",
        });
        this.accessToken = res.access_token;
        if (res.refresh_token) this.refreshToken = res.refresh_token;
        return true;
      } catch {
        this.clearTokens();
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // --- Mock Data ---

  private mockStorage = new Map<string, any>();

  // Backend node.NodePublic uses json:"id", not node_id.
  // Mock data matches that shape so the same code works in real and mock mode.
  private mockNodes: NodePublic[] = [
    {
      id: "node_us_nyc_01",
      node_name: "US East (New York)",
      status: "active",
      load_score: 32,
      cpu_usage: 34.5,
      memory_usage: 51.2,
      active_connections: 1287,
      degraded: false,
      last_heartbeat_at: new Date().toISOString(),
    },
    {
      id: "node_us_sfo_01",
      node_name: "US West (San Francisco)",
      status: "active",
      load_score: 45,
      cpu_usage: 48.1,
      memory_usage: 62.0,
      active_connections: 982,
      degraded: false,
      last_heartbeat_at: new Date().toISOString(),
    },
    {
      id: "node_eu_lhr_01",
      node_name: "UK (London)",
      status: "active",
      load_score: 28,
      cpu_usage: 29.3,
      memory_usage: 44.7,
      active_connections: 1563,
      degraded: false,
      last_heartbeat_at: new Date().toISOString(),
    },
    {
      id: "node_eu_fra_01",
      node_name: "Germany (Frankfurt)",
      status: "active",
      load_score: 38,
      cpu_usage: 41.0,
      memory_usage: 55.3,
      active_connections: 1134,
      degraded: false,
      last_heartbeat_at: new Date().toISOString(),
    },
    {
      id: "node_ap_sin_01",
      node_name: "Singapore",
      status: "active",
      load_score: 41,
      cpu_usage: 44.2,
      memory_usage: 58.1,
      active_connections: 876,
      degraded: false,
      last_heartbeat_at: new Date().toISOString(),
    },
    {
      id: "node_ap_tky_01",
      node_name: "Japan (Tokyo)",
      status: "active",
      load_score: 35,
      cpu_usage: 37.8,
      memory_usage: 49.6,
      active_connections: 1045,
      degraded: false,
      last_heartbeat_at: new Date().toISOString(),
    },
    {
      id: "node_eu_ams_01",
      node_name: "Netherlands (Amsterdam)",
      status: "active",
      load_score: 30,
      cpu_usage: 33.1,
      memory_usage: 47.2,
      active_connections: 1342,
      degraded: false,
      last_heartbeat_at: new Date().toISOString(),
    },
    {
      id: "node_us_ord_01",
      node_name: "US Central (Chicago)",
      status: "degraded",
      load_score: 72,
      cpu_usage: 78.9,
      memory_usage: 82.4,
      active_connections: 534,
      degraded: true,
      degraded_reason: "High memory pressure — scheduled maintenance",
      last_heartbeat_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: "node_au_syd_01",
      node_name: "Australia (Sydney)",
      status: "active",
      load_score: 43,
      cpu_usage: 46.3,
      memory_usage: 57.8,
      active_connections: 721,
      degraded: false,
      last_heartbeat_at: new Date().toISOString(),
    },
    {
      id: "node_sa_gru_01",
      node_name: "Brazil (São Paulo)",
      status: "degraded",
      load_score: 81,
      cpu_usage: 85.2,
      memory_usage: 79.5,
      active_connections: 312,
      degraded: true,
      degraded_reason: "Network latency spike — under investigation",
      last_heartbeat_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "node_eu_ath_01",
      node_name: "Greece (Athens)",
      status: "active",
      load_score: 22,
      cpu_usage: 24.7,
      memory_usage: 38.1,
      active_connections: 1894,
      degraded: false,
      last_heartbeat_at: new Date().toISOString(),
    },
    {
      id: "node_us_mia_01",
      node_name: "US East (Miami)",
      status: "active",
      load_score: 47,
      cpu_usage: 50.3,
      memory_usage: 61.0,
      active_connections: 893,
      degraded: false,
      last_heartbeat_at: new Date().toISOString(),
    },
  ];

  private async mockRequest<T>(path: string, options: RequestInit): Promise<T> {
    const body = options.body ? JSON.parse(options.body as string) : {};

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    switch (path) {
      case "/api/v1/auth/register": {
        const req = body as RegisterRequest;
        if (this.mockStorage.has(`user:${req.email}`)) {
          throw {
            status: 409,
            code: "AUTH_DUPLICATE_EMAIL",
            message: "An account with this email already exists.",
          } as ApiError;
        }
        if (req.password.length < 8) {
          throw {
            status: 400,
            code: "AUTH_WEAK_PASSWORD",
            message: "Password must be at least 8 characters.",
          } as ApiError;
        }
        const userId = crypto.randomUUID();
        this.mockStorage.set(`user:${req.email}`, {
          user_id: userId,
          email: req.email,
          display_name: req.display_name || null,
          password: req.password,
          roles: ["user"],
          permissions: [],
          subscription_status: "none",
          created_at: new Date().toISOString(),
        });
        return {
          user_id: userId,
          email_verification_required: true,
        } as T;
      }

      case "/api/v1/auth/login": {
        const req = body as LoginRequest;
        const user = this.mockStorage.get(`user:${req.email}`);
        if (!user || user.password !== req.password) {
          throw {
            status: 401,
            code: "AUTH_INVALID_CREDENTIALS",
            message: "Invalid email or password.",
          } as ApiError;
        }

        // Seed super_admin for admin login
        const isAdminLogin = req.client_type === "admin" && req.email === "admin@livemask.io";
        const roles = isAdminLogin
          ? ["super_admin", "admin"]
          : user.roles || ["user"];
        const permissions = isAdminLogin
          ? ["config:read", "config:write", "user:read", "user:write", "payment:read", "payment:write", "audit:read", "role:manage"]
          : [];

        if (req.client_type === "admin" && !roles.some((r: string) =>
          ["super_admin", "admin", "ops_operator", "support_agent", "finance_operator", "auditor", "sponsor_ambassador", "promotion_ambassador"].includes(r)
        )) {
          throw {
            status: 403,
            code: "AUTH_FORBIDDEN",
            message: "Admin access requires an administrative role.",
          } as ApiError;
        }

        return {
          user: {
            user_id: user.user_id,
            email: user.email,
            display_name: user.display_name,
            roles,
            permissions,
            subscription_status: user.subscription_status || "none",
            created_at: user.created_at,
          },
          access_token: `mock_at_${crypto.randomUUID()}`,
          refresh_token: `mock_rt_${crypto.randomUUID()}`,
          expires_in: 900,
        } as T;
      }

      case "/api/v1/auth/refresh": {
        return {
          access_token: `mock_at_${crypto.randomUUID()}`,
          refresh_token: `mock_rt_${crypto.randomUUID()}`,
          expires_in: 900,
        } as T;
      }

      case "/api/v1/auth/logout": {
        return { ok: true } as T;
      }

      case "/api/v1/me": {
        return {
          user_id: "usr_mock_001",
          email: "alice@example.com",
          display_name: "Alice",
          roles: ["user", "subscriber"],
          permissions: [],
          subscription_status: "active",
          created_at: "2025-12-01T00:00:00Z",
        } as T;
      }

      case "/api/v1/nodes/recommended": {
        const recommended = this.mockNodes.filter((n) => n.status === "active" && !n.degraded);
        return { nodes: recommended } as T;
      }

      case "/api/v1/nodes": {
        return { nodes: this.mockNodes, total: this.mockNodes.length } as T;
      }

      default:
        throw { status: 404, code: "NOT_FOUND", message: "Endpoint not found in mock" } as ApiError;
    }
  }

  // --- Public API ---

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await this.request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setTokens(res.access_token, res.refresh_token);
    return res;
  }

  async refresh(data: RefreshRequest): Promise<RefreshResponse> {
    return this.request<RefreshResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    await this.request("/api/v1/auth/logout", { method: "POST" }, true);
    this.clearTokens();
  }

  async getMe(): Promise<User> {
    return this.request<User>("/api/v1/me", {}, true);
  }

  async getNodes(): Promise<NodeListResponse> {
    return this.request<NodeListResponse>("/api/v1/nodes", {}, true);
  }

  async getRecommendedNodes(): Promise<RecommendedNodeResponse> {
    return this.request<RecommendedNodeResponse>("/api/v1/nodes/recommended", {}, true);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const authClient = new AuthApiClient();
export { getErrorMessage };
