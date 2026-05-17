import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/api";
import type { NodePublic } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import {
  Server, Globe, AlertTriangle, Loader2, RefreshCw,
  Shield, LogOut, Wifi, WifiOff,
} from "lucide-react";

// PortalLayout inline (matching AccountPages.tsx style)
function PortalLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-500" />
              <span className="text-sm font-bold text-foreground">LiveMask</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/account" className="text-muted-foreground hover:text-foreground">Account</Link>
            <Link to="/nodes" className="text-muted-foreground hover:text-foreground">Nodes</Link>
            <Link to="/billing" className="text-muted-foreground hover:text-foreground">Billing</Link>
            <Link to="/support" className="text-muted-foreground hover:text-foreground">Support</Link>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}

function LoadStatus({ score }: { score: number }) {
  if (score <= 33) return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Low</Badge>;
  if (score <= 66) return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">Medium</Badge>;
  return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">High</Badge>;
}

function StatusBadge({ status, degraded }: { status: string; degraded: boolean }) {
  if (degraded) return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">Degraded</Badge>;
  if (status === "active") return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Active</Badge>;
  if (status === "offline") return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Offline</Badge>;
  return <Badge variant="outline" className="text-xs">{status}</Badge>;
}

function NodeCard({ node }: { node: NodePublic }) {
  return (
    <Card className={`bg-card border-border ${node.degraded ? "border-amber-500/30" : "hover:border-teal-500/30"} transition-colors`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-2 ${node.degraded ? "bg-amber-500/10" : "bg-teal-500/10"}`}>
              {node.degraded ? (
                <WifiOff className="h-4 w-4 text-amber-500" />
              ) : (
                <Wifi className="h-4 w-4 text-teal-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{node.node_name}</p>
              <p className="text-xs text-muted-foreground font-mono">{node.id}</p>
            </div>
          </div>
          <StatusBadge status={node.status} degraded={node.degraded} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">CPU</span>
            <span className="text-foreground font-mono">{node.cpu_usage?.toFixed(1) ?? "—"}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Memory</span>
            <span className="text-foreground font-mono">{node.memory_usage?.toFixed(1) ?? "—"}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Load</span>
            <LoadStatus score={node.load_score} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Connections</span>
            <span className="text-foreground font-mono">{node.active_connections?.toLocaleString() ?? "—"}</span>
          </div>
        </div>

        {/* Degraded reason */}
        {node.degraded && node.degraded_reason && (
          <div className="mt-3 flex items-start gap-2 rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{node.degraded_reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function NodesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [allNodes, setAllNodes] = useState<NodePublic[]>([]);
  const [recommendedNodes, setRecommendedNodes] = useState<NodePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, recommended] = await Promise.all([
        authClient.getNodes(),
        authClient.getRecommendedNodes(),
      ]);
      setAllNodes(all.nodes ?? []);
      setRecommendedNodes(recommended.nodes ?? []);
    } catch (err: any) {
      if (err?.code === "AUTH_TOKEN_EXPIRED" || err?.code === "AUTH_REFRESH_REVOKED") {
        setError("Session expired. Please login again.");
      } else if (err?.status === 401) {
        setError("Authentication required. Please login to view nodes.");
      } else if (err?.status && err?.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to load nodes. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchNodes();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, fetchNodes]);

  // Not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <PortalLayout title="Nodes">
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-amber-500/10 p-4">
              <Shield className="h-10 w-10 text-amber-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Authentication Required</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Please sign in to view available nodes and their status.
          </p>
          <Link to="/login">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </PortalLayout>
    );
  }

  // Initial loading
  if (authLoading || (loading && allNodes.length === 0)) {
    return (
      <PortalLayout title="Nodes">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading nodes...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PortalLayout title="Nodes">
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-500/10 p-4">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Unable to Load Nodes</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{error}</p>
          <Button onClick={fetchNodes} className="bg-teal-600 hover:bg-teal-700 text-white">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </PortalLayout>
    );
  }

  // Empty state
  if (allNodes.length === 0) {
    return (
      <PortalLayout title="Nodes">
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-teal-500/10 p-4">
              <Server className="h-10 w-10 text-teal-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No Nodes Available</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            There are no nodes available at the moment. Please check back later.
          </p>
        </div>
      </PortalLayout>
    );
  }

  // Normal data display
  const degradedNodes = allNodes.filter((n) => n.degraded);

  return (
    <PortalLayout title="Nodes">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Server Nodes</h1>
            <p className="text-sm text-muted-foreground">
              View available nodes and their current status
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNodes}
            disabled={loading}
            className="text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{allNodes.length}</p>
              <p className="text-xs text-muted-foreground">Total Nodes</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-emerald-400">{recommendedNodes.length}</p>
              <p className="text-xs text-muted-foreground">Recommended</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-bold ${degradedNodes.length > 0 ? "text-amber-400" : "text-foreground"}`}>
                {degradedNodes.length}
              </p>
              <p className="text-xs text-muted-foreground">Degraded</p>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Nodes */}
        {recommendedNodes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-teal-500" />
              <h2 className="text-sm font-semibold text-foreground">Recommended Nodes</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {recommendedNodes.map((node) => (
                <NodeCard key={node.id} node={node} />
              ))}
            </div>
          </div>
        )}

        {/* All Nodes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">All Available Nodes</h2>
            <span className="text-xs text-muted-foreground">({allNodes.length})</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {allNodes.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
