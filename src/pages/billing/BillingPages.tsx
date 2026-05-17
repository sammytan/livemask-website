import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard, CheckCircle, AlertCircle, ArrowLeft, Loader2,
  Clock, XCircle, FileText, ExternalLink,
} from "lucide-react";
import { authClient, getErrorMessage } from "@/lib/api";
import type { SubscriptionDraft, PlanDraft, BillingHistoryItemDraft, ApiError } from "@/lib/types";
import { PortalLayout } from "@/pages/account/AccountPages";

// ── Shared Auth Guard ────────────────────────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Small delay to let auth state initialize from storage/token check
    const timer = setTimeout(() => {
      if (!authClient.isAuthenticated()) {
        navigate("/login", { replace: true });
        return;
      }
      setChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (checking) {
    return (
      <PortalLayout title="Loading...">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  return <>{children}</>;
}

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="bg-card border-border border-red-500/20">
      <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button size="sm" variant="outline" className="text-xs" onClick={onRetry}>
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Billing Overview (/billing) ────────────────────────────────────────
export function BillingOverviewPage() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const sub = await authClient.getSubscription();
      setSubscription(sub);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.code === "NOT_IMPLEMENTED") {
        // Backend not available — show mock fallback
        setSubscription({
          plan_id: "premium_monthly",
          status: "active",
          current_period_start: "2026-04-17T00:00:00Z",
          current_period_end: "2026-05-17T23:59:59Z",
          cancel_at_period_end: false,
          device_limit: 5,
          devices_used: 3,
        });
      } else {
        setError(getErrorMessage(apiErr));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authClient.isAuthenticated()) {
      fetchSubscription();
    }
  }, []);

  if (loading) {
    return (
      <PortalLayout title="Billing">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout title="Billing">
        <ErrorBox message={error} onRetry={fetchSubscription} />
      </PortalLayout>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "paused": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "expired":
      case "canceled": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "paused": return "Paused";
      case "expired": return "Expired";
      case "canceled": return "Canceled";
      default: return "No Plan";
    }
  };

  const planLabel = (planId: string) => {
    switch (planId) {
      case "free": return "Free";
      case "premium_monthly": return "Premium Monthly";
      case "premium_annual": return "Premium Annual";
      case "enterprise": return "Enterprise";
      default: return planId;
    }
  };

  return (
    <AuthGuard>
      <PortalLayout title="Billing">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing</h1>
            <p className="text-sm text-muted-foreground">Manage your subscription and billing</p>
          </div>

          {/* Current Subscription */}
          <Card className="bg-card border-border border-teal-500/30">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="h-5 w-5 text-teal-500" />
                    <h3 className="text-lg font-medium text-foreground">
                      {planLabel(subscription?.plan_id ?? "free")}
                    </h3>
                    <Badge variant="outline" className={`text-xs ${statusColor(subscription?.status ?? "none")}`}>
                      {statusLabel(subscription?.status ?? "none")}
                    </Badge>
                  </div>
                  {subscription?.current_period_end && (
                    <p className="text-sm text-muted-foreground">
                      {subscription.cancel_at_period_end ? "Ends" : "Renews"}{" "}
                      {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {subscription?.devices_used ?? 0} of {subscription?.device_limit ?? 0} devices used
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => navigate("/billing/plans")}
                  >
                    Change Plan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 text-amber-400 border-amber-500/30"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card
              className="bg-card border-border hover:border-teal-500/30 transition-colors cursor-pointer"
              onClick={() => navigate("/billing/plans")}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-lg bg-teal-500/10 p-2">
                  <CreditCard className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Plans</p>
                  <p className="text-xs text-muted-foreground">Compare and upgrade</p>
                </div>
              </CardContent>
            </Card>
            <Card
              className="bg-card border-border hover:border-teal-500/30 transition-colors cursor-pointer"
              onClick={() => navigate("/billing/history")}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">History</p>
                  <p className="text-xs text-muted-foreground">Invoices and payments</p>
                </div>
              </CardContent>
            </Card>
            <Card
              className="bg-card border-border hover:border-teal-500/30 transition-colors cursor-pointer"
              onClick={() => navigate("/billing/checkout")}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <ExternalLink className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Checkout</p>
                  <p className="text-xs text-muted-foreground">Upgrade process</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device usage bar */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Device Usage</h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => navigate("/account/devices")}
                >
                  Manage Devices
                </Button>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all"
                  style={{
                    width: subscription
                      ? `${Math.min(100, (subscription.devices_used / subscription.device_limit) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {subscription?.devices_used ?? 0} of {subscription?.device_limit ?? 0} devices used
              </p>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    </AuthGuard>
  );
}

// ── Plans Page (/billing/plans) ───────────────────────────────────────
export function PlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanDraft[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>("premium_monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, subRes] = await Promise.all([
        authClient.getPlans(),
        authClient.getSubscription(),
      ]);
      setPlans(plansRes.plans);
      setCurrentPlanId(subRes.plan_id);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.code === "NOT_IMPLEMENTED") {
        setPlans([
          { plan_id: "free", name: "Free", price_monthly: 0, device_limit: 1, node_access: "3 locations", features: ["1 device", "3 server locations", "Basic speed", "Community support"] },
          { plan_id: "premium_monthly", name: "Premium Monthly", price_monthly: 9.99, device_limit: 5, node_access: "All 50+ servers", features: ["5 devices", "All 50+ servers", "Max speed", "WireGuard protocol", "24/7 support"] },
          { plan_id: "premium_annual", name: "Premium Annual", price_monthly: 5.83, price_annual: 69.99, device_limit: 5, node_access: "All 50+ servers", features: ["5 devices", "All 50+ servers", "Max speed", "WireGuard protocol", "24/7 support", "2 months free"] },
          { plan_id: "enterprise", name: "Enterprise", price_monthly: 49.99, device_limit: 999, node_access: "Dedicated", features: ["Unlimited devices", "Dedicated servers", "SLA guarantee", "Admin console", "Priority support"] },
        ]);
      } else {
        setError(getErrorMessage(apiErr));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authClient.isAuthenticated()) fetchPlans();
  }, []);

  if (loading) {
    return (
      <PortalLayout title="Plans">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout title="Plans">
        <ErrorBox message={error} onRetry={fetchPlans} />
      </PortalLayout>
    );
  }

  return (
    <AuthGuard>
      <PortalLayout title="Plans">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/billing")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Plans</h1>
              <p className="text-sm text-muted-foreground">Choose the plan that fits your needs</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const isCurrent = plan.plan_id === currentPlanId;
              const price = plan.price_annual ?? plan.price_monthly ?? 0;
              const priceLabel = plan.price_annual !== undefined ? `$${plan.price_annual}/yr` : `$${plan.price_monthly}/mo`;

              return (
                <Card
                  key={plan.plan_id}
                  className={`bg-card border-border relative ${
                    isCurrent ? "ring-1 ring-teal-500/30" : ""
                  }`}
                >
                  <CardContent className="p-5">
                    {isCurrent && (
                      <Badge
                        variant="outline"
                        className="absolute top-3 right-3 bg-teal-500/10 text-teal-400 border-teal-500/20 text-xs"
                      >
                        Current
                      </Badge>
                    )}
                    <h3 className="font-medium text-foreground mb-1">{plan.name}</h3>
                    <p className="text-2xl font-bold text-foreground">
                      {price === 0 ? "Free" : `$${price}`}
                      <span className="text-sm text-muted-foreground font-normal">
                        {plan.price_annual ? "/year" : plan.price_monthly ? "/mo" : ""}
                      </span>
                    </p>
                    {plan.price_annual && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ${plan.price_monthly}/mo billed annually
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{plan.node_access}</p>
                    <div className="mt-4 space-y-1.5">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-teal-500 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    {!isCurrent && (
                      <Button
                        size="sm"
                        className="w-full mt-4 text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => navigate(`/billing/checkout?plan=${plan.plan_id}`)}
                      >
                        {price === 0 ? "Downgrade" : plan.price_monthly === 0 ? "Select" : "Upgrade"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </PortalLayout>
    </AuthGuard>
  );
}

// ── Billing History (/billing/history) ────────────────────────────────
export function BillingHistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<BillingHistoryItemDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.getBillingHistory();
      setItems(res.items);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.code === "NOT_IMPLEMENTED") {
        setItems([
          { invoice_id: "INV-2026-001", plan_name: "Premium Monthly", amount: 9.99, currency: "USD", status: "paid", paid_at: "2026-04-17T10:00:00Z", description: "Premium Monthly — May 2026" },
          { invoice_id: "INV-2026-002", plan_name: "Premium Monthly", amount: 9.99, currency: "USD", status: "paid", paid_at: "2026-03-17T10:00:00Z", description: "Premium Monthly — Apr 2026" },
          { invoice_id: "INV-2026-003", plan_name: "Premium Monthly", amount: 9.99, currency: "USD", status: "paid", paid_at: "2026-02-17T10:00:00Z", description: "Premium Monthly — Mar 2026" },
        ]);
      } else {
        setError(getErrorMessage(apiErr));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authClient.isAuthenticated()) fetchHistory();
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "pending": return <Clock className="h-4 w-4 text-amber-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      case "refunded": return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Paid</Badge>;
      case "pending": return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">Pending</Badge>;
      case "failed": return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Failed</Badge>;
      case "refunded": return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">Refunded</Badge>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <PortalLayout title="Billing History">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout title="Billing History">
        <ErrorBox message={error} onRetry={fetchHistory} />
      </PortalLayout>
    );
  }

  return (
    <AuthGuard>
      <PortalLayout title="Billing History">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/billing")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Billing History</h1>
              <p className="text-sm text-muted-foreground">View past invoices and payment status</p>
            </div>
          </div>

          {items.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No billing history yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.invoice_id}
                  className="flex items-center justify-between rounded border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(item.status)}
                    <div>
                      <p className="text-sm text-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.invoice_id}
                        {item.paid_at && ` • ${new Date(item.paid_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground font-mono">
                      ${item.amount.toFixed(2)} {item.currency}
                    </span>
                    {statusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PortalLayout>
    </AuthGuard>
  );
}

// ── Checkout Page (/billing/checkout) ─────────────────────────────────
export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const planId = params.get("plan") || "premium_monthly";

  const planPrice = planId === "enterprise"
    ? "$49.99/mo"
    : planId === "premium_annual"
    ? "$69.99/yr"
    : planId === "free"
    ? "Free"
    : "$9.99/mo";

  const planName = planId === "enterprise"
    ? "Enterprise"
    : planId === "premium_annual"
    ? "Premium Annual"
    : planId === "free"
    ? "Free"
    : "Premium Monthly";

  const handleProceed = async () => {
    try {
      const session = await authClient.createCheckoutSession(planId);
      if (session.url) {
        navigate(session.url);
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.code === "NOT_IMPLEMENTED") {
        // In non-mock mode, just show the placeholder message
      }
    }
  };

  return (
    <AuthGuard>
      <PortalLayout title="Checkout">
        <div className="space-y-6 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/billing/plans")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
              <p className="text-sm text-muted-foreground">Review and confirm your plan selection</p>
            </div>
          </div>

          {/* Order Summary */}
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-medium text-foreground">Order Summary</h3>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground">{planName}</span>
                <span className="text-sm text-foreground font-mono">{planPrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-mono">{planPrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-muted-foreground">Calculated at next step</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment gateway placeholder */}
          <Card className="bg-card border-border border-amber-500/20">
            <CardContent className="p-6 text-center space-y-3">
              <div className="rounded-full bg-amber-500/10 p-3 inline-flex mx-auto">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-sm text-foreground font-medium">Payment Gateway — Coming Soon</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Real payment processing will be implemented in a future Payment TASK.
                This is a UI skeleton for demonstration purposes only.
              </p>
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">
                Awaiting Payment TASK
              </Badge>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => navigate("/billing/plans")}
            >
              Change Plan
            </Button>
            <Button
              className="flex-1 text-xs bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleProceed}
            >
              Proceed to Payment
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your payment information is secure. No real payment is processed on this page.
          </p>
        </div>
      </PortalLayout>
    </AuthGuard>
  );
}
