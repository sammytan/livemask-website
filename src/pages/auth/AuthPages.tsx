import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email || !password) return;
    try {
      await login({ email, password, client_type: "website" });
      navigate("/account");
    } catch {
      // Error is handled by auth provider
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-teal-500/10 p-3">
              <Shield className="h-6 w-6 text-teal-500" />
            </div>
          </div>
          <CardTitle className="text-foreground text-lg">Sign in to LiveMask</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Your connection is secured end-to-end</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9 bg-background border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
                <Link to="/forgot-password" className="text-xs text-teal-400 hover:text-teal-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 bg-background border-border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">Remember device</label>
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-teal-400 hover:text-teal-300">Create Account</Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);
  const { register, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setLocalError("Please accept the Terms and Privacy Policy.");
      return;
    }

    try {
      await register({
        request_id: crypto.randomUUID(),
        email,
        password,
        referral_code: inviteCode || undefined,
        client_type: "website",
      });
      setSuccess(true);
    } catch {
      // Error is handled by auth provider
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-sm bg-card border-border">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-foreground text-lg">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-500/10 p-3">
                <Shield className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-sm text-foreground">Account created successfully!</p>
            <p className="text-xs text-muted-foreground">
              We sent a verification link to <strong className="text-foreground">{email}</strong>.
              Please check your email and verify your account to continue.
            </p>
            <Link to="/login">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full">Continue to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-teal-500/10 p-3">
              <Shield className="h-6 w-6 text-teal-500" />
            </div>
          </div>
          <CardTitle className="text-foreground text-lg">Create Account</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Get started with LiveMask Secure VPN</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(localError || error) && (
              <div className="flex items-center gap-2 rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{localError || error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs text-muted-foreground">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                className="bg-background border-border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-xs text-muted-foreground">Password</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Min 8 characters"
                className="bg-background border-border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm" className="text-xs text-muted-foreground">Confirm Password</Label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="Repeat password"
                className="bg-background border-border"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-invite" className="text-xs text-muted-foreground">Invite / Referral Code (optional)</Label>
              <Input
                id="reg-invite"
                type="text"
                placeholder="ABC123"
                className="bg-background border-border"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
              <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
                I agree to the <a href="#" className="text-teal-400">Terms of Service</a> and{" "}
                <a href="#" className="text-teal-400">Privacy Policy</a>
              </label>
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-400 hover:text-teal-300">Sign In</Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Mock: simulate sending reset email
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-foreground text-lg">Reset Password</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">We will send a reset link to your email</p>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-xs text-muted-foreground">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  className="bg-background border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Reset Link
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="rounded-full bg-emerald-500/10 p-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <p className="text-sm text-foreground">Reset link sent!</p>
              <p className="text-xs text-muted-foreground">
                Check your email for a password reset link. If you do not receive it within a few minutes,
                check your spam folder.
              </p>
              <Link to="/login" className="text-xs text-teal-400 hover:text-teal-300 inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export function VerifyEmailPage() {
  const [status] = useState<"verifying" | "success" | "expired">("success");

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-foreground text-lg">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "verifying" && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-teal-500 mx-auto" />
              <p className="text-sm text-muted-foreground">Verifying your email...</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-emerald-500/10 p-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <p className="text-sm text-foreground">Email verified successfully!</p>
              <p className="text-xs text-muted-foreground">
                Your account is now active. You can sign in and start using LiveMask.
              </p>
              <Link to="/login">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full">Continue to Login</Button>
              </Link>
            </>
          )}
          {status === "expired" && (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-amber-500/10 p-3">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <p className="text-sm text-foreground">Verification link expired</p>
              <p className="text-xs text-muted-foreground">
                This link has expired. Please request a new verification email from your account settings.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to Login</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export function AuthCallbackPage() {
  return <VerifyEmailPage />;
}

// --- Shared Layout ---

import { ArrowLeft, CheckCircle } from "lucide-react";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-500" />
            <span className="text-sm font-bold text-foreground">LiveMask</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground">Login</Link>
            <Link to="/register" className="text-muted-foreground hover:text-foreground">Create Account</Link>
          </div>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
