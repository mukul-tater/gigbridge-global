import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import PageTransition from "./components/PageTransition";
import PilotPhaseBanner from "./components/PilotPhaseBanner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import JobCategories from "./pages/JobCategories";
import Auth from "./pages/Auth";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerOnboarding from "./pages/partner/PartnerOnboarding";
import {
  EmitraRegisterPage,
  EmitraLoginPage,
  EmitraDashboardPage,
  EmitraWorkersPage,
  EmitraRegisterWorkerPage,
  EmitraWorkerDetailPage,
  EmitraNotificationsPage,
  EmitraCompliancePage,
} from "./modules/emitra";
import {
  WorkerAuthProvider,
  WorkerRegisterPage,
  WorkerLoginPage,
  WorkerDashboardPage,
  WorkerProtectedRoute,
  WorkerOnboardingPage,
} from "./modules/worker-registration";
import { useIsActiveModuleRoute } from "./modules/worker-registration/hooks/useIsWorkerRegistrationRoute";

const qc = new QueryClient();

function AppShell() {
  const isActiveModule = useIsActiveModuleRoute();

  return (
    <>
      {!isActiveModule && <PilotPhaseBanner />}
      <PageTransition>
        <Routes>
          {/* Original SafeWork Global home */}
          <Route path="/" element={<Index />} />

          {/* Public pages linked from home */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:slug" element={<JobDetail />} />
          <Route path="/job-categories" element={<JobCategories />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/auth" element={<Auth />} />

          {/* Phase-1 worker registration (backend API) */}
          <Route path="/register" element={<WorkerRegisterPage />} />
          <Route path="/login" element={<WorkerLoginPage />} />
          <Route
            path="/home"
            element={
              <WorkerProtectedRoute>
                <WorkerDashboardPage />
              </WorkerProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <WorkerProtectedRoute>
                <WorkerOnboardingPage />
              </WorkerProtectedRoute>
            }
          />

          {/* E-Mitra partner */}
          <Route path="/emitra/register" element={<EmitraRegisterPage />} />
          <Route path="/emitra/login" element={<EmitraLoginPage />} />
          <Route
            path="/emitra/dashboard"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <EmitraDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emitra/workers"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <EmitraWorkersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emitra/workers/register"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <EmitraRegisterWorkerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emitra/workers/:workerId"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <EmitraWorkerDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emitra/notifications"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <EmitraNotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emitra/compliance"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <EmitraCompliancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/onboarding"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <PartnerOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/dashboard"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />

          {/*
            Other legacy routes (employer, admin, legacy worker portal) remain disabled.
            See src/routes/LegacyRoutes.archive.tsx to restore.
          */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <WorkerAuthProvider>
              <AuthProvider>
                <ErrorBoundary>
                  <AppShell />
                </ErrorBoundary>
              </AuthProvider>
            </WorkerAuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
