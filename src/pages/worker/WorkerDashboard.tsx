import { useAuth } from "@/contexts/AuthContext";
import WorkerSidebar from "@/components/worker/WorkerSidebar";
import WorkerHeader from "@/components/worker/WorkerHeader";
import { Card } from "@/components/ui/card";
import { Briefcase, FileText, MessageSquare, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DocumentVerificationCard from "@/components/worker/DocumentVerificationCard";
import ECRStatusCard from "@/components/worker/ECRStatusCard";
import ProfileProgressCard from "@/components/worker/ProfileProgressCard";
import JobJourneyProgressCard from "@/components/worker/JobJourneyProgressCard";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import { DashboardSkeleton } from "@/components/ui/page-skeleton";

export default function WorkerDashboard() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobFormalities, setJobFormalities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchWorkerData();
    }
  }, [profile?.id]);

  const fetchWorkerData = async () => {
    try {
      const [docsRes, profileRes, skillsRes, expRes, certsRes, appsRes, formalitiesRes] = await Promise.all([
        supabase.from('worker_documents').select('*').eq('worker_id', profile?.id),
        supabase.from('worker_profiles').select('*').eq('user_id', profile?.id).single(),
        supabase.from('worker_skills').select('*').eq('worker_id', profile?.id),
        supabase.from('work_experience').select('*').eq('worker_id', profile?.id),
        supabase.from('worker_certifications').select('*').eq('worker_id', profile?.id),
        supabase.from('job_applications').select('*').eq('worker_id', profile?.id),
        supabase
          .from('job_formalities')
          .select(`
            *,
            jobs:job_id (
              title,
              location,
              country
            )
          `)
          .eq('worker_id', profile?.id)
      ]);

      setDocuments(docsRes.data || []);
      setWorkerProfile(profileRes.data);
      setSkills(skillsRes.data || []);
      setExperience(expRes.data || []);
      setCertifications(certsRes.data || []);
      setApplications(appsRes.data || []);
      setJobFormalities(formalitiesRes.data || []);
    } catch (error) {
      console.error('Error fetching worker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifiedDocsCount = documents.filter((d: any) => d.verification_status === 'verified').length;
  const pendingDocsCount = documents.filter((d: any) => d.verification_status === 'pending').length;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <WorkerSidebar />
        <div className="flex-1 flex flex-col">
          <WorkerHeader />
          <main className="flex-1 p-4 md:p-8">
            <DashboardSkeleton />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background w-full">
      <WorkerSidebar />
      <div className="flex-1 flex flex-col">
        <WorkerHeader />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <OnboardingStepper />
          
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'Worker'}!</h1>
            <p className="text-muted-foreground text-sm md:text-base">Here's an overview of your activity</p>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{applications.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Applications</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{verifiedDocsCount}/{documents.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Verified Documents</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{pendingDocsCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending Verifications</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{skills.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Skills Added</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <ProfileProgressCard
            hasProfile={!!workerProfile}
            hasDocuments={documents.length > 0}
            documentsVerified={verifiedDocsCount > 0}
            hasSkills={skills.length > 0}
            hasExperience={experience.length > 0}
            hasCertifications={certifications.length > 0}
          />
          <ECRStatusCard
            ecrStatus={workerProfile?.ecr_status || 'not_checked'}
            ecrCategory={workerProfile?.ecr_category || null}
            nationality={workerProfile?.nationality || null}
            hasPassport={workerProfile?.has_passport || false}
          />
        </div>

        <div className="mb-6 md:mb-8">
          <DocumentVerificationCard documents={documents} />
        </div>

        {jobFormalities.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl font-bold mb-4">Job Journey Progress</h2>
            <JobJourneyProgressCard formalities={jobFormalities} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="bg-primary/10 p-2 rounded">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Applied to Welder Position</p>
                  <p className="text-sm text-muted-foreground">ShreeFab Industries • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="bg-primary/10 p-2 rounded">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New message from NorthWorks</p>
                  <p className="text-sm text-muted-foreground">Interview invitation • 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Profile viewed by employer</p>
                  <p className="text-sm text-muted-foreground">Construction Ltd • 1 day ago</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recommended Jobs</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-1">Senior Welder</h3>
                <p className="text-sm text-muted-foreground mb-2">Dubai, UAE • $25-30/hr</p>
                <p className="text-sm">5+ years experience required</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-1">Electrician</h3>
                <p className="text-sm text-muted-foreground mb-2">Qatar • $22-28/hr</p>
                <p className="text-sm">Industrial experience preferred</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-1">Construction Supervisor</h3>
                <p className="text-sm text-muted-foreground mb-2">Saudi Arabia • $30-35/hr</p>
                <p className="text-sm">Leadership experience required</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      </div>
    </div>
  );
}
