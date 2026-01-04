import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

interface BreadcrumbConfig {
  [key: string]: string;
}

const routeLabels: BreadcrumbConfig = {
  // Worker routes
  worker: "Worker Portal",
  dashboard: "Dashboard",
  profile: "Profile",
  documents: "Documents",
  applications: "Applications",
  interviews: "Interviews",
  offers: "Offers",
  contracts: "Contracts",
  "contract-history": "Contract History",
  training: "Training",
  insurance: "Insurance",
  messaging: "Messages",
  notifications: "Notifications",
  calendar: "Calendar",
  "saved-searches": "Saved Searches",
  "travel-status": "Travel Status",
  "application-tracking": "Application Tracking",
  
  // Employer routes
  employer: "Employer Portal",
  "post-job": "Post Job",
  "manage-jobs": "Manage Jobs",
  "search-workers": "Search Workers",
  "worker-shortlist": "Shortlisted Workers",
  "application-review": "Application Review",
  "interview-scheduling": "Interview Scheduling",
  "offer-management": "Offer Management",
  "manage-formalities": "Manage Formalities",
  "contract-management": "Contract Management",
  payments: "Payments",
  "escrow-payments": "Escrow Payments",
  reports: "Reports",
  "compliance-reports": "Compliance Reports",
  "company-profile": "Company Profile",
  
  // Admin routes
  admin: "Admin Portal",
  "user-management": "User Management",
  "job-verification": "Job Verification",
  "document-verification": "Document Verification",
  "dispute-resolution": "Dispute Resolution",
  "compliance-check": "Compliance Check",
  "edit-job": "Edit Job",
};

interface PortalBreadcrumbProps {
  currentPageTitle?: string;
}

export default function PortalBreadcrumb({ currentPageTitle }: PortalBreadcrumbProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  
  if (pathSegments.length === 0) return null;

  const getLabel = (segment: string): string => {
    return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  };

  const buildPath = (index: number): string => {
    return "/" + pathSegments.slice(0, index + 1).join("/");
  };

  // Determine the portal type based on the first segment
  const portalType = pathSegments[0];
  const isPortalPage = ["worker", "employer", "admin"].includes(portalType);

  if (!isPortalPage) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={`/${portalType}`} className="flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{getLabel(portalType)}</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathSegments.slice(1).map((segment, index) => {
          const isLast = index === pathSegments.length - 2;
          const path = buildPath(index + 1);
          const label = currentPageTitle && isLast ? currentPageTitle : getLabel(segment);

          return (
            <span key={path} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
