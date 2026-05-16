import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowRight, Server, Globe, Lock, Zap, ChevronRight, Star, Download, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function HomePage() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-500" />
            <span className="text-sm font-bold text-foreground">LiveMask</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/download" className="text-muted-foreground hover:text-foreground transition-colors">Download</Link>
            <Link to="/security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            {isAuthenticated ? (
              <>
                <Link to="/account" className="text-muted-foreground hover:text-foreground transition-colors">Account</Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
                <Link to="/register">
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20 mb-6">
            Trusted by 10,000+ users worldwide
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Browse the Internet with
            <span className="text-teal-400"> Privacy</span> and{" "}
            <span className="text-teal-400"> Freedom</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            LiveMask provides enterprise-grade VPN protection with blazing-fast speeds,
            military-grade encryption, and a strict no-logs policy.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white h-11 px-6 text-sm">
                Get LiveMask Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="h-11 px-6 text-sm">
                View Plans
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> 30-day money-back</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> No logs</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> 24/7 support</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Why LiveMask?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We combine cutting-edge technology with a relentless focus on privacy.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Military-Grade Encryption",
                description: "AES-256 encryption protects your data from prying eyes.",
                color: "text-teal-500",
                bg: "bg-teal-500/10",
              },
              {
                icon: Globe,
                title: "Global Server Network",
                description: "Connect to 50+ servers across 30 countries for unrestricted access.",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                icon: Zap,
                title: "Blazing-Fast Speeds",
                description: "Optimized routing and WireGuard protocol for maximum performance.",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                icon: Shield,
                title: "Strict No-Logs Policy",
                description: "We never track, log, or share your browsing activity.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Server,
                title: "Multi-Device Support",
                description: "Protect up to 5 devices with a single subscription.",
                color: "text-purple-500",
                bg: "bg-purple-500/10",
              },
              {
                icon: Star,
                title: "24/7 Customer Support",
                description: "Our team is always ready to help you.",
                color: "text-rose-500",
                bg: "bg-rose-500/10",
              },
            ].map((feature, i) => (
              <Card key={i} className="bg-card border-border hover:border-teal-500/20 transition-colors">
                <CardContent className="p-6">
                  <div className={`rounded-lg ${feature.bg} p-3 w-fit mb-4`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Take Control of Your Privacy?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of satisfied users. Get started for free, no credit card required.
          </p>
          <Link to="/register">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white h-12 px-8 text-sm">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-teal-500" />
            <span>LiveMask &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PricingPage() {
  return (
    <MarketingPageLayout title="Pricing">
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground">Choose the plan that fits your needs. All plans include a 30-day money-back guarantee.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "Free", price: "$0", period: "/mo", desc: "Basic VPN protection",
              features: ["1 device", "3 server locations", "Basic speed", "Community support"],
              cta: "Get Started", popular: false,
            },
            {
              name: "Premium", price: "$9.99", period: "/mo", desc: "Full VPN experience",
              features: ["5 devices", "All 50+ servers", "Max speed", "WireGuard protocol", "24/7 support"],
              cta: "Subscribe Now", popular: true,
            },
            {
              name: "Enterprise", price: "$49.99", period: "/mo", desc: "For teams & businesses",
              features: ["Unlimited devices", "Dedicated servers", "SLA guarantee", "Admin console", "Priority support"],
              cta: "Contact Sales", popular: false,
            },
          ].map((plan, i) => (
            <Card key={i} className={`bg-card border-border ${plan.popular ? "ring-1 ring-teal-500/30 relative" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-teal-600 text-white text-xs">Most Popular</Badge>
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
                <p className="text-3xl font-bold text-foreground mb-6">
                  {plan.price}<span className="text-sm text-muted-foreground font-normal">{plan.period}</span>
                </p>
                <div className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link to="/register">
                  <Button
                    className={`w-full text-xs h-9 ${plan.popular ? "bg-teal-600 hover:bg-teal-700 text-white" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MarketingPageLayout>
  );
}

export function DownloadPage() {
  return (
    <MarketingPageLayout title="Download">
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-teal-500/10 p-4">
              <Download className="h-10 w-10 text-teal-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Download LiveMask</h1>
          <p className="text-muted-foreground mb-8">Available on all major platforms.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "iOS", desc: "iPhone & iPad", icon: Smartphone },
              { name: "Android", desc: "Phones & Tablets", icon: Smartphone },
              { name: "macOS", desc: "MacBooks & iMacs", icon: Monitor },
              { name: "Windows", desc: "PC & Laptops", icon: Monitor },
              { name: "Linux", desc: "Ubuntu, Debian, Fedora", icon: Terminal },
              { name: "Browser", desc: "Chrome & Firefox", icon: Globe },
            ].map((platform, i) => (
              <Card key={i} className="bg-card border-border hover:border-teal-500/30 cursor-pointer transition-colors">
                <CardContent className="p-4 text-center">
                  <platform.icon className="h-8 w-8 text-teal-500 mx-auto mb-2" />
                  <h3 className="text-sm font-medium text-foreground">{platform.name}</h3>
                  <p className="text-xs text-muted-foreground">{platform.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MarketingPageLayout>
  );
}

export function SecurityPage() {
  return (
    <MarketingPageLayout title="Security">
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-teal-500/10 p-4">
                <Lock className="h-10 w-10 text-teal-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">Security & Privacy</h1>
            <p className="text-muted-foreground">Your privacy is our top priority.</p>
          </div>
          <div className="space-y-6">
            {[
              { title: "AES-256 Encryption", desc: "Military-grade encryption protects all your data traffic." },
              { title: "No-Logs Policy", desc: "We do not collect, store, or share your browsing data." },
              { title: "Kill Switch", desc: "Automatically blocks all traffic if the VPN connection drops." },
              { title: "DNS Leak Protection", desc: "All DNS queries are routed through our encrypted tunnel." },
              { title: "WireGuard Protocol", desc: "Modern, fast, and secure VPN protocol." },
              { title: "RAM-Only Servers", desc: "All servers run on RAM, ensuring no data persistence." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-border/50">
                <Shield className="h-5 w-5 text-teal-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MarketingPageLayout>
  );
}

export function FAQPage() {
  const faqs = [
    { q: "What is LiveMask?", a: "LiveMask is a premium VPN service that protects your online privacy and security." },
    { q: "Is my data logged?", a: "No. We have a strict no-logs policy. We never track or store your online activity." },
    { q: "How many devices can I use?", a: "Free plan: 1 device. Premium: up to 5 devices. Enterprise: unlimited." },
    { q: "Is there a money-back guarantee?", a: "Yes! All plans come with a 30-day money-back guarantee." },
    { q: "Which protocols do you support?", a: "We support WireGuard and OpenVPN protocols." },
    { q: "Can I use LiveMask for streaming?", a: "Yes, our Premium plan works with major streaming platforms." },
  ];

  return (
    <MarketingPageLayout title="FAQ">
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">Everything you need to know about LiveMask.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-lg border border-border/50 p-4">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </MarketingPageLayout>
  );
}

// Marketing page shared layout
import { Smartphone, Monitor, Terminal } from "lucide-react";

function MarketingPageLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-500" />
            <span className="text-sm font-bold text-foreground">LiveMask</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/pricing" className={`transition-colors ${title === "Pricing" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Pricing</Link>
            <Link to="/download" className={`transition-colors ${title === "Download" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Download</Link>
            <Link to="/security" className={`transition-colors ${title === "Security" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Security</Link>
            <Link to="/faq" className={`transition-colors ${title === "FAQ" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>FAQ</Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
