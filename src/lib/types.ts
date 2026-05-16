// Auth Types — matching auth-rbac.md contract

export type ClientType = "app" | "website" | "admin";

export type UserStatus = "active" | "disabled" | "suspended";

export type SubscriptionStatus = "none" | "active" | "expired" | "paused";

export interface User {
  user_id: string;
  email: string;
  display_name?: string;
  roles: string[];
  permissions: string[];
  subscription_status: SubscriptionStatus;
  created_at: string;
}

export interface AdminMeResponse extends User {
  admin_namespaces: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  client_type: ClientType;
  mfa_code?: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface RegisterRequest {
  request_id: string;
  email: string;
  password: string;
  display_name?: string;
  referral_code?: string;
  client_type: ClientType;
}

export interface RegisterResponse {
  user_id: string;
  email_verification_required: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface RefreshRequest {
  refresh_token?: string;
  client_type: ClientType;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

// Error codes from contract
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  REFRESH_REVOKED: "AUTH_REFRESH_REVOKED",
  EMAIL_NOT_VERIFIED: "AUTH_EMAIL_NOT_VERIFIED",
  MFA_REQUIRED: "AUTH_MFA_REQUIRED",
  FORBIDDEN: "AUTH_FORBIDDEN",
  ROUTE_NAMESPACE_DENIED: "AUTH_ROUTE_NAMESPACE_DENIED",
  RATE_LIMITED: "AUTH_RATE_LIMITED",
  WEAK_PASSWORD: "AUTH_WEAK_PASSWORD",
  DUPLICATE_EMAIL: "AUTH_DUPLICATE_EMAIL",
} as const;

// Permission strings from contract
export const PERMISSIONS = {
  CONFIG_READ: "config:read",
  CONFIG_WRITE: "config:write",
  USER_READ: "user:read",
  USER_WRITE: "user:write",
  PAYMENT_READ: "payment:read",
  PAYMENT_WRITE: "payment:write",
  AUDIT_READ: "audit:read",
  ROLE_MANAGE: "role:manage",
  SPONSOR_SELF_READ: "sponsor:self_read",
  SPONSOR_SELF_WRITE: "sponsor:self_write",
  AMBASSADOR_SELF_READ: "ambassador:self_read",
  AMBASSADOR_SELF_WRITE: "ambassador:self_write",
} as const;

// Roles from contract
export const ROLES = {
  USER: "user",
  SUBSCRIBER: "subscriber",
  SPONSOR_AMBASSADOR: "sponsor_ambassador",
  PROMOTION_AMBASSADOR: "promotion_ambassador",
  SUPPORT_AGENT: "support_agent",
  OPS_OPERATOR: "ops_operator",
  FINANCE_OPERATOR: "finance_operator",
  AUDITOR: "auditor",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;
