import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

// Worker Pages
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerProfile from "./pages/worker/WorkerProfile";
import WorkerApplications from "./pages/worker/WorkerApplications";
import WorkerMessaging from "./pages/worker/WorkerMessaging";
import WorkerDocuments from "./pages/worker/WorkerDocuments";
import WorkerNotifications from "./pages/worker/WorkerNotifications";

// Employer Pages
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import CompanyProfile from "./pages/employer/CompanyProfile";
import PostJob from "./pages/employer/PostJob";
import ManageJobs from "./pages/employer/ManageJobs";
import SearchWorkers from "./pages/employer/SearchWorkers";
import EmployerMessaging from "./pages/employer/EmployerMessaging";
import EmployerPayments from "./pages/employer/EmployerPayments";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import JobVerification from "./pages/admin/JobVerification";
import ComplianceCheck from "./pages/admin/ComplianceCheck";
import Reports from "./pages/admin/Reports";
import DisputeResolution from "./pages/admin/DisputeResolution";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Worker Routes */}
            <Route path="/worker/dashboard" element={
              <ProtectedRoute allowedRoles={["WORKER"]}>
                <WorkerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/worker/profile" element={
              <ProtectedRoute allowedRoles={["WORKER"]}>
                <WorkerProfile />
              </ProtectedRoute>
            } />
            <Route path="/worker/applications" element={
              <ProtectedRoute allowedRoles={["WORKER"]}>
                <WorkerApplications />
              </ProtectedRoute>
            } />
            <Route path="/worker/messaging" element={
              <ProtectedRoute allowedRoles={["WORKER"]}>
                <WorkerMessaging />
              </ProtectedRoute>
            } />
            <Route path="/worker/documents" element={
              <ProtectedRoute allowedRoles={["WORKER"]}>
                <WorkerDocuments />
              </ProtectedRoute>
            } />
            <Route path="/worker/notifications" element={
              <ProtectedRoute allowedRoles={["WORKER"]}>
                <WorkerNotifications />
              </ProtectedRoute>
            } />

            {/* Employer Routes */}
            <Route path="/employer/dashboard" element={
              <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employer/company" element={
              <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                <CompanyProfile />
              </ProtectedRoute>
            } />
            <Route path="/employer/post-job" element={
              <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                <PostJob />
              </ProtectedRoute>
            } />
            <Route path="/employer/manage-jobs" element={
              <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                <ManageJobs />
              </ProtectedRoute>
            } />
            <Route path="/employer/search-workers" element={
              <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                <SearchWorkers />
              </ProtectedRoute>
            } />
            <Route path="/employer/messaging" element={
              <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                <EmployerMessaging />
              </ProtectedRoute>
            } />
            <Route path="/employer/payments" element={
              <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                <EmployerPayments />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/job-verification" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <JobVerification />
              </ProtectedRoute>
            } />
            <Route path="/admin/compliance" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ComplianceCheck />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/admin/disputes" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DisputeResolution />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
