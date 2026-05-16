import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, User, Smartphone, Monitor, Lock, CreditCard,
  CheckCircle, AlertCircle, ShoppingCart, Trophy, HeadphonesIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

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

// Placeholder cards for future features
const placeholderEntries = [
  {
    title: "Subscription",
    description: "Manage your plan, billing, and payment methods",
    icon: CreditCard,
    route: "/billing",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
  },
  {
    title: "Devices",
    description: "View and manage connected devices",
    icon: Smartphone,
    route: "/account",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "C2C Market",
    description: "Buy and sell bandwidth in the community marketplace",
    icon: ShoppingCart,
    route: "/market",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Points & Rewards",
    description: "Earn and redeem points for rewards",
    icon: Trophy,
    route: "/points",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Support",
    description: "Get help, report issues, and view tickets",
    icon: HeadphonesIcon,
    route: "/support",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

export function AccountPage() {
  return (
    <PortalLayout title="Account">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, security, and devices</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
            <TabsTrigger value="devices" className="text-xs">Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySection />
          </TabsContent>

          <TabsContent value="devices">
            <DevicesSection />
          </TabsContent>
        </Tabs>

        {/* Placeholder entry cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Access</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {placeholderEntries.map((entry) => (
              <Link key={entry.route} to={entry.route}>
                <Card className="bg-card border-border hover:border-teal-500/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`rounded-lg ${entry.bgColor} p-2 shrink-0`}>
                      <entry.icon className={`h-5 w-5 ${entry.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{entry.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

function ProfileSection() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-teal-500/10 p-4">
            <User className="h-8 w-8 text-teal-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">alice@example.com</p>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs mt-1">
              Premium Plan
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">User ID:</span>{" "}
            <span className="text-foreground font-mono">usr_001</span>
          </div>
          <div>
            <span className="text-muted-foreground">Member since:</span>{" "}
            <span className="text-foreground">Dec 2025</span>
          </div>
          <div>
            <span className="text-muted-foreground">Plan:</span>{" "}
            <span className="text-foreground">Premium Monthly</span>
          </div>
          <div>
            <span className="text-muted-foreground">Devices:</span>{" "}
            <span className="text-foreground">3 / 5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SecuritySection() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-sm font-medium text-foreground">Security Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded border border-border bg-background/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-sm text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-xs h-7">Change</Button>
          </div>
          <div className="flex items-center justify-between rounded border border-border bg-background/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Not enabled</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-xs h-7">Enable</Button>
          </div>
        </div>
        <h3 className="text-sm font-medium text-foreground pt-2">Recent Login Activity</h3>
        <div className="space-y-2">
          {[
            { device: "iPhone 15 Pro", location: "New York, US", time: "Today, 10:30 AM", current: true },
            { device: "MacBook Pro", location: "New York, US", time: "Yesterday, 8:15 PM", current: false },
            { device: "iPad Air", location: "Boston, US", time: "May 14, 3:00 PM", current: false },
          ].map((login, i) => (
            <div key={i} className="flex items-center justify-between text-xs rounded border border-border bg-background/50 px-3 py-2">
              <span className="text-foreground">{login.device}</span>
              <span className="text-muted-foreground">{login.location}</span>
              <span className="text-muted-foreground">{login.time}</span>
              {login.current && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  Current
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DevicesSection() {
  const devices = [
    { id: "dev_001", name: "iPhone 15 Pro", platform: "iOS 17.4", appVersion: "2.4.1", lastActive: "Now", trusted: true },
    { id: "dev_002", name: "MacBook Pro", platform: "macOS 14.3", appVersion: "2.4.1", lastActive: "2h ago", trusted: true },
    { id: "dev_003", name: "iPad Air", platform: "iPadOS 17.4", appVersion: "2.4.0", lastActive: "2 days ago", trusted: false },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">3 of 5 device slots used</p>
        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7">
          + Add Device
        </Button>
      </div>

      <div className="space-y-2">
        {devices.map((dev) => (
          <div key={dev.id} className="flex items-center justify-between rounded border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              {dev.platform.includes("iOS") || dev.platform.includes("iPad") ? (
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Monitor className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm text-foreground">{dev.name}</p>
                <p className="text-xs text-muted-foreground">{dev.platform} • v{dev.appVersion}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{dev.lastActive}</span>
              {dev.trusted ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Trusted</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Untrusted</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BillingPage() {
  return (
    <PortalLayout title="Billing">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">Manage your subscription and payment history</p>
        </div>

        <Card className="bg-card border-border border-teal-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-5 w-5 text-teal-500" />
                  <h3 className="text-lg font-medium text-foreground">Premium Monthly</h3>
                </div>
                <p className="text-sm text-muted-foreground">$9.99/month &bull; Renews May 30, 2026</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">Active</Badge>
                  <span className="text-xs text-muted-foreground">5 devices &bull; All nodes &bull; WireGuard</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" className="text-xs h-7">Change Plan</Button>
                <Button size="sm" variant="outline" className="text-xs h-7 text-amber-400 border-amber-500/30">Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Available Plans</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "Free", price: "$0", period: "/mo", features: ["1 device", "3 nodes", "Basic speed"], current: false },
              { name: "Premium", price: "$9.99", period: "/mo", features: ["5 devices", "All nodes", "Max speed", "WireGuard"], current: true },
              { name: "Enterprise", price: "$49.99", period: "/mo", features: ["Unlimited", "Dedicated nodes", "SLA", "Admin"], current: false },
            ].map((plan) => (
              <Card key={plan.name} className={`bg-card border-border ${plan.current ? "ring-1 ring-teal-500/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{plan.name}</h4>
                    {plan.current && (
                      <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {plan.price}<span className="text-sm text-muted-foreground font-normal">{plan.period}</span>
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-teal-500" />{f}
                      </div>
                    ))}
                  </div>
                  {!plan.current && (
                    <Button size="sm" variant="outline" className="w-full mt-3 text-xs h-7">Select</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

export function MarketplacePage() {
  return (
    <PortalLayout title="C2C Market">
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-purple-500/10 p-4">
            <ShoppingCart className="h-10 w-10 text-purple-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">C2C Marketplace</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Buy and sell bandwidth in the community marketplace. Coming soon.
        </p>
        <Badge variant="outline" className="mt-4 text-xs">Coming Soon</Badge>
      </div>
    </PortalLayout>
  );
}

export function PointsPage() {
  return (
    <PortalLayout title="Points & Rewards">
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-amber-500/10 p-4">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Points & Rewards</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Earn points through referrals, usage, and community participation. Coming soon.
        </p>
        <Badge variant="outline" className="mt-4 text-xs">Coming Soon</Badge>
      </div>
    </PortalLayout>
  );
}

export function SupportPage() {
  return (
    <PortalLayout title="Support">
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-emerald-500/10 p-4">
            <HeadphonesIcon className="h-10 w-10 text-emerald-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Support Center</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Get help, report issues, and view your support tickets. Coming soon.
        </p>
        <Badge variant="outline" className="mt-4 text-xs">Coming Soon</Badge>
      </div>
    </PortalLayout>
  );
}
