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
  Plan,
  SubscriptionView,
  BillingHistoryItem,
  DeviceView,
  DevicesResponse,
} from "./types";
import { configureAuthProvider, authenticatedFetch } from "./authenticated-fetch";

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
  DEVICE_LIMIT_EXCEEDED: "Device limit reached. Please remove a device before adding a new one.",
  BILLING_PLAN_NOT_FOUND: "Selected plan was not found. Please try again.",
  BILLING_CHECKOUT_NOT_SUPPORTED: "Checkout is not yet supported. Payment integration coming soon.",
};

function getErrorMessage(error: ApiError): string {
  return AUTH_ERRORS_MAP[error.code] || error.message || "An unexpected error occurred.";
}

class AuthApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private mockMode = MOCK_MODE;

  constructor() {
    // Wire up the authenticatedFetch utility to this client's token store
    // and refresh mechanism so it can read tokens and retry on 401.
    configureAuthProvider(
      () => this.accessToken,
      () => this.tryRefresh(),
    );
  }

  setTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Unauthenticated request — used only for public endpoints:
   *   POST /api/v1/auth/register
   *   POST /api/v1/auth/login
   *   POST /api/v1/auth/refresh
   *
   * These endpoints do not require a Bearer token.
   * 401 retry / token refresh is NOT performed here.
   */
  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    if (this.mockMode) {
      return this.mockRequest<T>(path, options);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({
        code: "UNKNOWN",
        message: response.statusText,
      }));
      const flatBody = errorBody.error || errorBody;
      throw { status: response.status, ...flatBody } as ApiError;
    }

    return response.json();
  }

  /**
   * Authenticated request — used for all protected endpoints.
   * In mock mode delegates to mockRequest; in real mode uses
   * the unified authenticatedFetch which handles Bearer token,
   * 401 refresh + retry, and structured error parsing.
   */
  private async authRequest<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    if (this.mockMode) {
      return this.mockRequest<T>(path, options);
    }
    return authenticatedFetch<T>(path, options);
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

  // Mock billing/devices data — aligned with Backend types
  private mockSubscription: SubscriptionView = {
    plan_id: "premium_monthly",
    status: "active",
    current_period_start: "2026-04-17T00:00:00Z",
    current_period_end: "2026-05-17T23:59:59Z",
    cancel_at_period_end: false,
    device_limit: 5,
    device_used: 3,
  };

  private mockPlans: Plan[] = [
    { plan_id: "free", name: "Free", price_cents: 0, currency: "USD", billing_period: "monthly", device_limit: 1, node_access: "basic", features: ["1 device", "Basic nodes"] },
    { plan_id: "premium_monthly", name: "Premium", price_cents: 999, currency: "USD", billing_period: "monthly", device_limit: 5, node_access: "all", features: ["5 devices", "All nodes", "Priority speed"] },
    { plan_id: "enterprise_monthly", name: "Enterprise", price_cents: 2999, currency: "USD", billing_period: "monthly", device_limit: 20, node_access: "all", features: ["20 devices", "All nodes", "Priority speed", "Dedicated support"] },
  ];

  private mockBillingHistory: BillingHistoryItem[] = [
    { invoice_id: "inv_mock_001", plan_id: "premium_monthly", amount_cents: 999, currency: "USD", status: "paid", paid_at: "2026-04-17T10:00:00Z", created_at: "2026-03-18T10:00:00Z" },
    { invoice_id: "inv_mock_002", plan_id: "premium_monthly", amount_cents: 999, currency: "USD", status: "paid", paid_at: "2026-03-17T10:00:00Z", created_at: "2026-02-18T10:00:00Z" },
    { invoice_id: "inv_mock_003", plan_id: "premium_monthly", amount_cents: 999, currency: "USD", status: "paid", paid_at: "2026-02-17T10:00:00Z", created_at: "2026-01-18T10:00:00Z" },
  ];

  private mockDevices: DeviceView[] = [
    { device_id: "dev_mock_001", device_name: "iPhone 15 Pro", platform: "ios", app_version: "2.4.1", trusted: true, last_active_at: new Date().toISOString(), created_at: "2026-01-15T08:30:00Z" },
    { device_id: "dev_mock_002", device_name: "MacBook Pro", platform: "macos", app_version: "2.4.1", trusted: true, last_active_at: new Date(Date.now() - 3600000).toISOString(), created_at: "2026-02-10T12:00:00Z" },
    { device_id: "dev_mock_003", device_name: "iPad Air", platform: "ipados", app_version: "2.4.0", trusted: false, last_active_at: new Date(Date.now() - 86400000 * 2).toISOString(), created_at: "2026-03-01T09:00:00Z" },
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

      // ── Billing / Device mock endpoints ────────────────────────────
      case "/api/v1/billing/subscription": {
        return { subscription: { ...this.mockSubscription } } as T;
      }
      case "/api/v1/billing/plans": {
        return { plans: this.mockPlans } as T;
      }
      case "/api/v1/billing/history": {
        return { items: this.mockBillingHistory } as T;
      }
      case "/api/v1/billing/checkout": {
        return {
          checkout_id: "cs_mock_" + crypto.randomUUID().slice(0, 8),
          status: "mock_created",
          redirect_url: null,
        } as T;
      }
      case "/api/v1/devices": {
        if (options.method === "POST") {
          const newDevice: DeviceView = {
            device_id: "dev_mock_" + crypto.randomUUID().slice(0, 6),
            device_name: (body as { device_name: string }).device_name || "New Device",
            platform: (body as { platform: string }).platform || "unknown",
            trusted: false,
            created_at: new Date().toISOString(),
          };
          this.mockDevices.push(newDevice);
          return { ...newDevice } as T;
        }
        return {
          devices: this.mockDevices,
          device_limit: 5,
          device_used: this.mockDevices.length,
        } as T;
      }
      default: {
        // DELETE /api/v1/devices/{id}
        if (path.startsWith("/api/v1/devices/")) {
          const deviceId = path.replace("/api/v1/devices/", "");
          this.mockDevices = this.mockDevices.filter((d) => d.device_id !== deviceId);
          return { ok: true } as T;
        }
        throw { status: 404, code: "NOT_FOUND", message: "Endpoint not found in mock" } as ApiError;
      }
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
    await this.authRequest("/api/v1/auth/logout", { method: "POST" });
    this.clearTokens();
  }

  async getMe(): Promise<User> {
    return this.authRequest<User>("/api/v1/me", {});
  }

  async getNodes(): Promise<NodeListResponse> {
    return this.authRequest<NodeListResponse>("/api/v1/nodes", {});
  }

  async getRecommendedNodes(): Promise<RecommendedNodeResponse> {
    return this.authRequest<RecommendedNodeResponse>("/api/v1/nodes/recommended", {});
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // ── Billing / Device API ───────────────────────────────────────────
  // Real mode calls Backend; mock mode uses mockRequest.

  async getSubscription(): Promise<SubscriptionView> {
    const res = await this.authRequest<{ subscription: SubscriptionView }>("/api/v1/billing/subscription", {});
    return res.subscription ?? { plan_id: "free", status: "active", cancel_at_period_end: false, device_limit: 1, device_used: 0 };
  }

  async getPlans(): Promise<{ plans: Plan[] }> {
    return this.authRequest<{ plans: Plan[] }>("/api/v1/billing/plans", {});
  }

  async getBillingHistory(): Promise<{ items: BillingHistoryItem[] }> {
    return this.authRequest<{ items: BillingHistoryItem[] }>("/api/v1/billing/history", {});
  }

  async createCheckoutSession(planId: string): Promise<{ checkout_id: string; status: string; redirect_url: string | null }> {
    return this.authRequest<{ checkout_id: string; status: string; redirect_url: string | null }>(
      "/api/v1/billing/checkout",
      { method: "POST", body: JSON.stringify({ plan_id: planId, payment_method: "mock" }) },
    );
  }

  async getDevices(): Promise<DevicesResponse> {
    return this.authRequest<DevicesResponse>("/api/v1/devices", {});
  }

  async revokeDevice(deviceId: string): Promise<{ ok: boolean }> {
    // Backend: DELETE /api/v1/devices/{device_id}
    return this.authRequest<{ ok: boolean }>(
      `/api/v1/devices/${deviceId}`,
      { method: "DELETE" },
    );
  }

  async addDevice(deviceName: string, platform: string): Promise<DeviceView> {
    // Backend returns HTTP 201 with DeviceView body (not wrapped in {device: ...})
    return this.authRequest<DeviceView>(
      "/api/v1/devices",
      { method: "POST", body: JSON.stringify({ device_name: deviceName, platform }) },
    );
  }
}

export const authClient = new AuthApiClient();
export { getErrorMessage };
