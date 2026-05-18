import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { HomePage, PricingPage, DownloadPage, SecurityPage, FAQPage } from "@/pages/WebsitePage";
import {
  BlogListPage,
  BlogArticlePage,
  BlogCategoryPage,
  BlogTagPage,
} from "@/pages/blog";
import { LoginPage, RegisterPage, ForgotPasswordPage, VerifyEmailPage, AuthCallbackPage } from "@/pages/auth/AuthPages";
import { AccountPage, MarketplacePage, PointsPage, SupportPage } from "@/pages/account/AccountPages";
import { DevicesPage } from "@/pages/account/DevicesPage";
import { NodesPage } from "@/pages/nodes/NodesPage";
import {
  BillingOverviewPage,
  PlansPage,
  BillingHistoryPage,
  CheckoutPage,
} from "@/pages/billing/BillingPages";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    {/* Public Website */}
    <Route path="/" element={<HomePage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/download" element={<DownloadPage />} />
    <Route path="/security" element={<SecurityPage />} />
    <Route path="/faq" element={<FAQPage />} />

    {/* Blog */}
    <Route path="/blog" element={<BlogListPage />} />
    <Route path="/blog/category/:category" element={<BlogCategoryPage />} />
    <Route path="/blog/tag/:tag" element={<BlogTagPage />} />
    <Route path="/blog/:slug" element={<BlogArticlePage />} />

    {/* Auth */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />
    <Route path="/auth/callback" element={<AuthCallbackPage />} />

    {/* User Portals */}
    <Route path="/account" element={<AccountPage />} />
    <Route path="/account/devices" element={<DevicesPage />} />
    <Route path="/account/*" element={<AccountPage />} />
    <Route path="/nodes" element={<NodesPage />} />
    <Route path="/nodes/*" element={<NodesPage />} />
    <Route path="/billing" element={<BillingOverviewPage />} />
    <Route path="/billing/plans" element={<PlansPage />} />
    <Route path="/billing/history" element={<BillingHistoryPage />} />
    <Route path="/billing/checkout" element={<CheckoutPage />} />
    <Route path="/billing/*" element={<Navigate to="/billing" replace />} />
    <Route path="/market" element={<MarketplacePage />} />
    <Route path="/market/*" element={<MarketplacePage />} />
    <Route path="/points" element={<PointsPage />} />
    <Route path="/points/*" element={<PointsPage />} />
    <Route path="/support" element={<SupportPage />} />
    <Route path="/support/*" element={<SupportPage />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };
