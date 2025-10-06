import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { EmployerOnboardingData } from '@/pages/EmployerOnboarding';
import { toast } from 'sonner';

interface Props {
  data: EmployerOnboardingData;
  onComplete: (data: Partial<EmployerOnboardingData>) => void;
  onNext: () => void;
}

export default function ComplianceStep({ data, onComplete, onNext }: Props) {
  const [complianceStatus, setComplianceStatus] = useState<'verified' | 'pending' | 'failed'>(
    data.compliance?.status || 'pending'
  );
  const [documents, setDocuments] = useState<Array<{ name: string; url: string; status: string }>>(
    data.compliance?.documents || []
  );
  const [isChecking, setIsChecking] = useState(false);

  const handleComplianceCheck = async () => {
    setIsChecking(true);
    try {
      // Mock API call to government/embassy compliance check
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const statuses: Array<'verified' | 'pending' | 'failed'> = ['verified', 'pending', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      setComplianceStatus(randomStatus);

      if (randomStatus === 'verified') {
        toast.success('Compliance check passed!', {
          description: 'All documents meet government requirements.',
        });
      } else if (randomStatus === 'pending') {
        toast.info('Compliance check in progress', {
          description: 'Your documents are being reviewed by authorities.',
        });
      } else {
        toast.error('Compliance check failed', {
          description: 'Some documents need to be resubmitted.',
        });
      }
    } catch (error) {
      toast.error('Compliance check failed');
    } finally {
      setIsChecking(false);
    }
  };

  const handleFileUpload = (files: Array<{ name: string; url: string; type: string; size: number }>) => {
    const newDocs = files.map((f) => ({
      name: f.name,
      url: f.url,
      status: 'uploaded',
    }));
    setDocuments([...documents, ...newDocs]);
  };

  const handleContinue = () => {
    const compliance = {
      status: complianceStatus,
      documents,
    };
    onComplete({ compliance });
    onNext();
  };

  const getStatusConfig = () => {
    const configs = {
      verified: {
        icon: CheckCircle,
        label: 'Verified',
        variant: 'default' as const,
        color: 'text-green-600',
      },
      pending: {
        icon: Clock,
        label: 'Pending Review',
        variant: 'secondary' as const,
        color: 'text-yellow-600',
      },
      failed: {
        icon: XCircle,
        label: 'Failed',
        variant: 'destructive' as const,
        color: 'text-red-600',
      },
    };
    return configs[complianceStatus];
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Shield className="mr-2 h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Compliance & Verification</h2>
        <Badge variant={statusConfig.variant} className="ml-auto">
          <StatusIcon className="mr-1 h-3 w-3" />
          {statusConfig.label}
        </Badge>
      </div>

      <div className="p-6 border rounded-lg bg-card">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full bg-muted ${statusConfig.color}`}>
            <StatusIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Government & Embassy Compliance Check</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We verify your company's compliance with international labor laws and embassy requirements
              for hiring foreign workers.
            </p>
            
            {complianceStatus === 'failed' && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-4">
                <p className="text-sm text-destructive">
                  Please review and resubmit the following documents:
                </p>
                <ul className="list-disc list-inside text-sm text-destructive mt-2">
                  <li>Business license verification</li>
                  <li>Labor compliance certificate</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Required Documents</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload any additional compliance documents (business licenses, permits, certifications)
          </p>
          <FileUpload
            onUploadComplete={handleFileUpload}
            accept="image/*,application/pdf"
            maxSize={10}
            multiple
          />
        </div>

        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Uploaded Documents</h4>
            {documents.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1">{doc.name}</span>
                <Badge variant="secondary">{doc.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleComplianceCheck}
          disabled={isChecking || documents.length === 0}
          className="flex-1"
        >
          {isChecking ? 'Checking...' : 'Run Compliance Check'}
        </Button>
        <Button
          onClick={handleContinue}
          disabled={complianceStatus === 'pending' || isChecking}
          className="flex-1"
        >
          Continue to Review
        </Button>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          ℹ️ Compliance checks typically take 1-3 business days. You can continue with the onboarding
          process and we'll notify you once verification is complete.
        </p>
      </div>
    </div>
  );
}
