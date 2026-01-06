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
import JobCategories from "./pages/JobCategories";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import InstallPWA from "./pages/InstallPWA";
import ResetPassword from "./pages/ResetPassword";
import EmailVerificationPending from "./pages/EmailVerificationPending";

// Worker Pages
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerProfile from "./pages/worker/WorkerProfile";
import WorkerApplications from "./pages/worker/WorkerApplications";
import WorkerApplicationDetail from "./pages/worker/WorkerApplicationDetail";
import ApplicationTracking from "./pages/worker/ApplicationTracking";
import WorkerMessaging from "./pages/worker/WorkerMessaging";
import WorkerDocuments from "./pages/worker/WorkerDocuments";
import WorkerNotifications from "./pages/worker/WorkerNotifications";
import WorkerTraining from "./pages/worker/Training";
import WorkerContracts from "./pages/worker/Contracts";
import WorkerTravelStatus from "./pages/worker/TravelStatus";
import WorkerInsurance from "./pages/worker/Insurance";
import WorkerSavedSearches from "./pages/worker/SavedSearches";
import WorkerPublicProfile from "./pages/worker/WorkerPublicProfile";
import WorkerOffers from "./pages/worker/WorkerOffers";
import WorkerInterviews from "./pages/worker/WorkerInterviews";
import WorkerCalendar from "./pages/worker/WorkerCalendar";
import WorkerContractHistory from "./pages/worker/ContractHistory";
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
import ApplicationDetail from "./pages/employer/ApplicationDetail";
import WorkerShortlist from "./pages/employer/WorkerShortlist";
import ManageFormalities from "./pages/employer/ManageFormalities";
import EmployerPayments from "./pages/employer/EmployerPayments";
import ContractManagement from "./pages/employer/ContractManagement";
import EmployerContractHistory from "./pages/employer/ContractHistory";
import EmployerReports from "./pages/employer/EmployerReports";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import JobVerification from "./pages/admin/JobVerification";
import EditJob from "./pages/admin/EditJob";
import DocumentVerification from "./pages/admin/DocumentVerification";
import IDVerification from "./pages/admin/IDVerification";
import ECRManagement from "./pages/admin/ECRManagement";
import ComplianceCheck from "./pages/admin/ComplianceCheck";
import Reports from "./pages/admin/Reports";
import DisputeResolution from "./pages/admin/DisputeResolution";

// Worker Verification
import WorkerVerificationStatus from "./pages/worker/VerificationStatus";

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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerificationPending />} />
            <Route path="/install" element={<InstallPWA />} />
            <Route path="/seed-data" element={<SeedData />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:slug" element={<JobDetail />} />
            <Route path="/job-categories" element={<JobCategories />} />
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
            <Route path="/worker/applications/:applicationId" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerApplicationDetail />
              </ProtectedRoute>
            } />
            <Route path="/worker/application-tracking" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <ApplicationTracking />
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
            <Route path="/worker/offers" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerOffers />
              </ProtectedRoute>
            } />
            <Route path="/worker/interviews" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerInterviews />
              </ProtectedRoute>
            } />
            <Route path="/worker/calendar" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerCalendar />
              </ProtectedRoute>
            } />
            <Route path="/worker/contract-history" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerContractHistory />
              </ProtectedRoute>
            } />
            <Route path="/worker/verification" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerVerificationStatus />
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
            <Route path="/employer/applications/:applicationId" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <ApplicationDetail />
              </ProtectedRoute>
            } />
            <Route path="/employer/shortlist" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <WorkerShortlist />
              </ProtectedRoute>
            } />
            <Route path="/employer/formalities" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <ManageFormalities />
              </ProtectedRoute>
            } />
            <Route path="/employer/payments" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerPayments />
              </ProtectedRoute>
            } />
            <Route path="/employer/contracts" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <ContractManagement />
              </ProtectedRoute>
            } />
            <Route path="/employer/contract-history" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerContractHistory />
              </ProtectedRoute>
            } />
            <Route path="/employer/reports" element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerReports />
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
            <Route path="/admin/edit-job/:jobId" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditJob />
              </ProtectedRoute>
            } />
            <Route path="/admin/document-verification" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DocumentVerification />
              </ProtectedRoute>
            } />
            <Route path="/admin/id-verification" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <IDVerification />
              </ProtectedRoute>
            } />
            <Route path="/admin/ecr-management" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ECRManagement />
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
