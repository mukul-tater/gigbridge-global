import { Building2, Briefcase, Shield, CheckCircle, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EmployerOnboardingData } from '@/pages/EmployerOnboarding';

interface Props {
  data: EmployerOnboardingData;
  onComplete: (data: Partial<EmployerOnboardingData>) => void;
  onNext: () => void;
}

export default function ReviewStep({ data }: Props) {
  const { companyProfile, jobPosting, compliance } = data;

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const configs = {
      verified: { label: 'Verified', variant: 'default' as const },
      pending: { label: 'Pending', variant: 'secondary' as const },
      failed: { label: 'Failed', variant: 'destructive' as const },
    };
    
    const config = configs[status as keyof typeof configs];
    return config ? <Badge variant={config.variant}>{config.label}</Badge> : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <CheckCircle className="mr-2 h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Review & Submit</h2>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm">
          Please review all information before submitting. After submission, your profile will be locked
          for review by our team.
        </p>
      </div>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-primary" />
              <CardTitle>Company Profile</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(companyProfile?.verificationStatus)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Company Name</p>
              <p className="font-medium">{companyProfile?.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-medium">{companyProfile?.industry}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Number</p>
              <p className="font-medium">{companyProfile?.registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{companyProfile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{companyProfile?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">
                {companyProfile?.city}, {companyProfile?.country}
              </p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium">{companyProfile?.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* Job Posting */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-primary" />
              <CardTitle>Job Posting</CardTitle>
            </div>
            <Badge variant="secondary">Draft</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Job Title</p>
            <p className="font-medium text-lg">{jobPosting?.title}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">{jobPosting?.description}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">
                {jobPosting?.city}, {jobPosting?.country}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salary Range</p>
              <p className="font-medium">
                {jobPosting?.currency} {jobPosting?.minSalary?.toLocaleString()} -{' '}
                {jobPosting?.maxSalary?.toLocaleString()}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Required Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {jobPosting?.skills?.map((skill, idx) => (
                <Badge key={idx} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          {jobPosting?.accommodation && (
            <div className="flex items-center gap-2">
              <Badge>Accommodation Provided</Badge>
            </div>
          )}
          {jobPosting?.benefits && (
            <div>
              <p className="text-sm text-muted-foreground">Benefits</p>
              <p className="text-sm">{jobPosting.benefits}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-primary" />
              <CardTitle>Compliance Status</CardTitle>
            </div>
            {getStatusBadge(compliance?.status)}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Documents submitted: {compliance?.documents?.length || 0}
          </p>
          {compliance?.documents && compliance.documents.length > 0 && (
            <div className="space-y-2">
              {compliance.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{doc.name}</span>
                  <Badge variant="secondary">{doc.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">What happens next?</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          <li>Your profile will be reviewed by our team (1-2 business days)</li>
          <li>We'll verify your documents and compliance status</li>
          <li>You'll receive an email notification once approved</li>
          <li>Start posting jobs and hiring talented workers worldwide</li>
        </ol>
      </div>
    </div>
  );
}
