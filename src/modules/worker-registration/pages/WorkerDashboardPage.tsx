import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, FileText, MessageSquare, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import DocumentVerificationCard from "@/components/worker/DocumentVerificationCard";
import ECRStatusCard from "@/components/worker/ECRStatusCard";
import ProfileProgressCard from "@/components/worker/ProfileProgressCard";
import ApplicationProgressCard from "@/components/worker/ApplicationProgressCard";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import { DashboardSkeleton } from "@/components/ui/page-skeleton";
import SalaryProtectionPromise from "@/components/SalaryProtectionPromise";
import PortalBreadcrumb from "@/components/PortalBreadcrumb";
import { useWorkerAuth } from "../context/WorkerAuthContext";
import { workerApi } from "../services/workerApi";
import { phase1WorkerNavGroups, phase1WorkerProfileMenu } from "@/config/phase1WorkerNav";

export default function WorkerDashboardPage() {
  const { worker, token } = useWorkerAuth();
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const [ecrStatus, setEcrStatus] = useState<string>("not_checked");
  const [hasPassport, setHasPassport] = useState(false);

  useEffect(() => {
    if (!token) {
      setOnboardingLoading(false);
      return;
    }
    workerApi
      .getOnboarding(token)
      .then((data) => {
        setEcrStatus(data.ecrStatus?.toLowerCase() || "not_checked");
        setHasPassport(data.hasPassport);
      })
      .catch(() => {})
      .finally(() => setOnboardingLoading(false));
  }, [token]);

  if (!worker || onboardingLoading) {
    return (
      <DashboardLayout
        navGroups={phase1WorkerNavGroups}
        portalLabel="Worker Portal"
        portalName="Worker Portal"
        profileMenuItems={phase1WorkerProfileMenu}
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const firstName = worker.fullName.split(" ")[0];

  return (
    <DashboardLayout
      navGroups={phase1WorkerNavGroups}
      portalLabel="Worker Portal"
      portalName="Worker Portal"
      profileMenuItems={phase1WorkerProfileMenu}
    >
      <PortalBreadcrumb />
      <OnboardingStepper />

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, {firstName}!</h1>
        <p className="text-muted-foreground text-sm">Here&apos;s an overview of your activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { icon: Briefcase, value: 0, label: "Applications", color: "text-primary", to: "/home" },
          { icon: FileText, value: "0/0", label: "Verified Docs", color: "text-success", to: "/onboarding" },
          { icon: MessageSquare, value: 0, label: "Pending Checks", color: "text-warning", to: "/onboarding" },
          { icon: TrendingUp, value: 1, label: "Skills Added", color: "text-info", to: "/onboarding" },
        ].map((stat) => (
          <Link key={stat.label} to={stat.to} aria-label={`Go to ${stat.label}`}>
            <Card className="p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 cursor-pointer h-full">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ProfileProgressCard
          hasProfile
          hasDocuments={false}
          documentsVerified={false}
          hasSkills
          hasExperience
          hasCertifications={false}
        />
        <ECRStatusCard
          ecrStatus={ecrStatus}
          ecrCategory={null}
          nationality="India"
          hasPassport={hasPassport}
        />
      </div>

      <div className="mb-6">
        <DocumentVerificationCard documents={[]} />
      </div>

      <div className="mb-6">
        <ApplicationProgressCard userId="" />
      </div>

      <div className="mb-6">
        <SalaryProtectionPromise />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-lg font-bold mb-3">Recent Activity</h2>
          <p className="text-muted-foreground text-center py-6 text-sm">No recent activity</p>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold mb-3">Recommended Jobs</h2>
          <p className="text-muted-foreground text-center py-6 text-sm">No jobs available</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
