import type { ReactNode } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import WorkerDashboard from '@/pages/worker/WorkerDashboard';
import WorkerProfile from '@/pages/worker/WorkerProfile';
import WorkerApplications from '@/pages/worker/WorkerApplications';
import WorkerApplicationDetail from '@/pages/worker/WorkerApplicationDetail';
import ApplicationTracking from '@/pages/worker/ApplicationTracking';
import WorkerMessaging from '@/pages/worker/WorkerMessaging';
import WorkerDocuments from '@/pages/worker/WorkerDocuments';
import WorkerNotifications from '@/pages/worker/WorkerNotifications';
import WorkerTraining from '@/pages/worker/Training';
import WorkerContracts from '@/pages/worker/Contracts';
import WorkerTravelStatus from '@/pages/worker/TravelStatus';
import WorkerInsurance from '@/pages/worker/Insurance';
import WorkerSavedSearches from '@/pages/worker/SavedSearches';
import WorkerSavedJobs from '@/pages/worker/SavedJobs';
import WorkerPublicProfile from '@/pages/worker/WorkerPublicProfile';
import WorkerOffers from '@/pages/worker/WorkerOffers';
import WorkerInterviews from '@/pages/worker/WorkerInterviews';
import WorkerCalendar from '@/pages/worker/WorkerCalendar';
import WorkerContractHistory from '@/pages/worker/ContractHistory';
import WorkerPayments from '@/pages/worker/WorkerPayments';
import WorkerVerificationStatus from '@/pages/worker/VerificationStatus';
import WorkerOnboarding from '@/pages/worker/WorkerOnboarding';
import WorkerTrust from '@/pages/worker/WorkerTrust';
import WorkerDiscover from '@/pages/worker/WorkerDiscover';
import ApplicationSuccess from '@/pages/worker/ApplicationSuccess';

function WorkerRoute({ path, children }: { path: string; children: ReactNode }) {
  return (
    <Route
      path={path}
      element={<ProtectedRoute allowedRoles={['worker']}>{children}</ProtectedRoute>}
    />
  );
}

/** Supabase/Lovable worker portal routes (restored from legacy App.tsx). */
export const legacyWorkerRoutes = (
  <>
    <WorkerRoute path="/worker/trust"><WorkerTrust /></WorkerRoute>
    <WorkerRoute path="/worker/discover"><WorkerDiscover /></WorkerRoute>
    <WorkerRoute path="/worker/application-success/:applicationId">
      <ApplicationSuccess />
    </WorkerRoute>
    <WorkerRoute path="/worker/onboarding"><WorkerOnboarding /></WorkerRoute>
    <WorkerRoute path="/worker/dashboard"><WorkerDashboard /></WorkerRoute>
    <WorkerRoute path="/worker/profile"><WorkerProfile /></WorkerRoute>
    <WorkerRoute path="/worker/applications"><WorkerApplications /></WorkerRoute>
    <WorkerRoute path="/worker/applications/:applicationId">
      <WorkerApplicationDetail />
    </WorkerRoute>
    <WorkerRoute path="/worker/application-tracking"><ApplicationTracking /></WorkerRoute>
    <WorkerRoute path="/worker/messaging"><WorkerMessaging /></WorkerRoute>
    <WorkerRoute path="/worker/training"><WorkerTraining /></WorkerRoute>
    <WorkerRoute path="/worker/contracts"><WorkerContracts /></WorkerRoute>
    <WorkerRoute path="/worker/travel"><WorkerTravelStatus /></WorkerRoute>
    <WorkerRoute path="/worker/insurance"><WorkerInsurance /></WorkerRoute>
    <WorkerRoute path="/worker/documents"><WorkerDocuments /></WorkerRoute>
    <WorkerRoute path="/worker/notifications"><WorkerNotifications /></WorkerRoute>
    <WorkerRoute path="/worker/saved-searches"><WorkerSavedSearches /></WorkerRoute>
    <WorkerRoute path="/worker/saved-jobs"><WorkerSavedJobs /></WorkerRoute>
    <WorkerRoute path="/worker/offers"><WorkerOffers /></WorkerRoute>
    <WorkerRoute path="/worker/interviews"><WorkerInterviews /></WorkerRoute>
    <WorkerRoute path="/worker/calendar"><WorkerCalendar /></WorkerRoute>
    <WorkerRoute path="/worker/contract-history"><WorkerContractHistory /></WorkerRoute>
    <WorkerRoute path="/worker/verification"><WorkerVerificationStatus /></WorkerRoute>
    <WorkerRoute path="/worker/payments"><WorkerPayments /></WorkerRoute>
    <Route path="/worker-profile/:id" element={<WorkerPublicProfile />} />
  </>
);
