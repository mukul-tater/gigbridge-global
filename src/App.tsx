import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import PageTransition from "./components/PageTransition";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import InstallPWA from "./pages/InstallPWA";

// Worker Pages
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerProfile from "./pages/worker/WorkerProfile";
import WorkerApplications from "./pages/worker/WorkerApplications";
import WorkerMessaging from "./pages/worker/WorkerMessaging";
import WorkerDocuments from "./pages/worker/WorkerDocuments";
import WorkerNotifications from "./pages/worker/WorkerNotifications";
import WorkerTraining from "./pages/worker/Training";
import WorkerContracts from "./pages/worker/Contracts";
import WorkerTravelStatus from "./pages/worker/TravelStatus";
import WorkerInsurance from "./pages/worker/Insurance";
import WorkerSavedSearches from "./pages/worker/SavedSearches";
import WorkerPublicProfile from "./pages/worker/WorkerPublicProfile";
import SeedData from "./pages/SeedData";

// Employer Pages
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployerProfile from "./pages/employer/EmployerProfile";
import CompanyProfile from "./pages/employer/CompanyProfile";
import PostJob from "./pages/employer/PostJob";
import ManageJobs from "./pages/employer/ManageJobs";
import SearchWorkers from "./pages/employer/SearchWorkers";
import EmployerMessaging from "./pages/employer/EmployerMessaging";
import EmployerInterviews from "./pages/employer/InterviewScheduling";
import EmployerOffers from "./pages/employer/OfferManagement";
import EmployerEscrow from "./pages/employer/EscrowPayments";
import EmployerCompliance from "./pages/employer/ComplianceReports";
import EmployerSavedSearches from "./pages/employer/SavedSearches";
import ApplicationReview from "./pages/employer/ApplicationReview";
import WorkerShortlist from "./pages/employer/WorkerShortlist";

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
          <PWAInstallPrompt />
          <PageTransition>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<InstallPWA />} />
            <Route path="/seed-data" element={<SeedData />} />
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
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/worker/profile" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerProfile />
              </ProtectedRoute>
            } />
            <Route path="/worker/applications" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerApplications />
              </ProtectedRoute>
            } />
            <Route path="/worker/messaging" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerMessaging />
              </ProtectedRoute>
            } />
            <Route path="/worker/training" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerTraining />
              </ProtectedRoute>
            } />
            <Route path="/worker/contracts" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerContracts />
              </ProtectedRoute>
            } />
            <Route path="/worker/travel" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerTravelStatus />
              </ProtectedRoute>
            } />
            <Route path="/worker/insurance" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerInsurance />
              </ProtectedRoute>
            } />
            <Route path="/worker/documents" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerDocuments />
              </ProtectedRoute>
            } />
            <Route path="/worker/notifications" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerNotifications />
              </ProtectedRoute>
            } />
            <Route path="/worker/saved-searches" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerSavedSearches />
              </ProtectedRoute>
            } />

            {/* Employer Routes */}
            <Route path="/employer/dashboard" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employer/profile" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerProfile />
              </ProtectedRoute>
            } />
            <Route path="/employer/company" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <CompanyProfile />
              </ProtectedRoute>
            } />
            <Route path="/employer/post-job" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <PostJob />
              </ProtectedRoute>
            } />
            <Route path="/employer/manage-jobs" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <ManageJobs />
              </ProtectedRoute>
            } />
            <Route path="/employer/search-workers" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <SearchWorkers />
              </ProtectedRoute>
            } />
            <Route path="/employer/interviews" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerInterviews />
              </ProtectedRoute>
            } />
            <Route path="/employer/offers" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerOffers />
              </ProtectedRoute>
            } />
            <Route path="/employer/escrow" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerEscrow />
              </ProtectedRoute>
            } />
            <Route path="/employer/compliance" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerCompliance />
              </ProtectedRoute>
            } />
            <Route path="/employer/messaging" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerMessaging />
              </ProtectedRoute>
            } />
            <Route path="/employer/saved-searches" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerSavedSearches />
              </ProtectedRoute>
            } />
            <Route path="/worker-profile/:id" element={<WorkerPublicProfile />} />
            <Route path="/employer/applications" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <ApplicationReview />
              </ProtectedRoute>
            } />
            <Route path="/employer/shortlist" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <WorkerShortlist />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/job-verification" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <JobVerification />
              </ProtectedRoute>
            } />
            <Route path="/admin/compliance" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ComplianceCheck />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/admin/disputes" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DisputeResolution />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </PageTransition>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
