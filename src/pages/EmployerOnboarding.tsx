import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CompanyProfileStep from '@/components/employer-onboarding/CompanyProfileStep';
import JobPostingStep from '@/components/employer-onboarding/JobPostingStep';
import ComplianceStep from '@/components/employer-onboarding/ComplianceStep';
import ReviewStep from '@/components/employer-onboarding/ReviewStep';
import { toast } from 'sonner';

export interface EmployerOnboardingData {
  companyProfile?: {
    companyName: string;
    industry: string;
    registrationNumber: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    address: string;
    logoUrl?: string;
    certificateUrl?: string;
    verificationStatus?: 'verified' | 'pending' | 'failed';
  };
  jobPosting?: {
    title: string;
    description: string;
    skills: string[];
    country: string;
    city: string;
    minSalary: number;
    maxSalary: number;
    currency: string;
    accommodation: boolean;
    benefits: string;
  };
  compliance?: {
    status: 'verified' | 'pending' | 'failed';
    documents: Array<{ name: string; url: string; status: string }>;
  };
}

const STEPS = [
  { id: 1, title: 'Company Profile', component: CompanyProfileStep },
  { id: 2, title: 'Job Posting', component: JobPostingStep },
  { id: 3, title: 'Compliance', component: ComplianceStep },
  { id: 4, title: 'Review', component: ReviewStep },
];

export default function EmployerOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<EmployerOnboardingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepComplete = (stepData: Partial<EmployerOnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...stepData }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success('Onboarding submitted successfully!', {
        description: 'Your company profile is under review.',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to submit onboarding', {
        description: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Employer Onboarding</h1>
          <p className="text-muted-foreground">
            Complete your profile to start posting jobs and hiring talented workers worldwide
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  step.id <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                <div className="text-sm">{step.title}</div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Step {currentStep} of {STEPS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6 mb-6">
          <CurrentStepComponent
            data={onboardingData}
            onComplete={handleStepComplete}
            onNext={handleNext}
          />
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep === STEPS.length ? (
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="min-w-[150px]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
