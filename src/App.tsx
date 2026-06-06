import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import PageTransition from "./components/PageTransition";
import NotFound from "./pages/NotFound";
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
  WorkerRegistrationHome,
  WorkerRegisterPage,
  WorkerLoginPage,
  WorkerDashboardPage,
  WorkerProtectedRoute,
  WorkerOnboardingPage,
} from "./modules/worker-registration";

const qc = new QueryClient();

function AppShell() {
  return (
    <>
      <PageTransition>
        <Routes>
          {/* ── Worker (Phase-1 registration) ── */}
          <Route path="/" element={<WorkerRegistrationHome />} />
          <Route path="/worker-start" element={<Navigate to="/" replace />} />
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

          {/* ── E-Mitra partner ── */}
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
          {/* Partner application flow (linked from E-Mitra nav) */}
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
            ── DISABLED: Legacy platform routes ──
            See src/routes/LegacyRoutes.archive.tsx and git history to restore.
            Includes: Index home, /auth, /jobs, employer, admin, legacy /worker/* (Supabase), etc.
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
