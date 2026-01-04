import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, FileText, Briefcase, GraduationCap, Building2, 
  CheckCircle2, ChevronRight, X 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  completed: boolean;
}

interface OnboardingStepperProps {
  onDismiss?: () => void;
}

export default function OnboardingStepper({ onDismiss }: OnboardingStepperProps) {
  const { user, role, profile } = useAuth();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user && role) {
      checkOnboardingProgress();
    }
  }, [user, role, profile]);

  const checkOnboardingProgress = async () => {
    if (!user) return;

    try {
      if (role === 'worker') {
        const [profileRes, docsRes, skillsRes, expRes] = await Promise.all([
          supabase.from('worker_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('worker_documents').select('id').eq('worker_id', user.id),
          supabase.from('worker_skills').select('id').eq('worker_id', user.id),
          supabase.from('work_experience').select('id').eq('worker_id', user.id)
        ]);

        const workerProfile = profileRes.data;
        const hasBasicInfo = !!profile?.full_name && !!profile?.phone;
        const hasBio = !!workerProfile?.bio;
        const hasDocs = (docsRes.data?.length || 0) > 0;
        const hasSkills = (skillsRes.data?.length || 0) > 0;
        const hasExp = (expRes.data?.length || 0) > 0;

        setSteps([
          {
            id: 'basic',
            title: 'Complete Basic Profile',
            description: 'Add your name, phone, and bio',
            icon: <User className="h-5 w-5" />,
            route: '/worker/profile',
            completed: hasBasicInfo && hasBio
          },
          {
            id: 'documents',
            title: 'Upload Documents',
            description: 'Add passport, ID, and certificates',
            icon: <FileText className="h-5 w-5" />,
            route: '/worker/documents',
            completed: hasDocs
          },
          {
            id: 'skills',
            title: 'Add Your Skills',
            description: 'List your professional skills',
            icon: <GraduationCap className="h-5 w-5" />,
            route: '/worker/profile',
            completed: hasSkills
          },
          {
            id: 'experience',
            title: 'Work Experience',
            description: 'Add previous job history',
            icon: <Briefcase className="h-5 w-5" />,
            route: '/worker/profile',
            completed: hasExp
          }
        ]);
      } else if (role === 'employer') {
        const [profileRes, jobsRes] = await Promise.all([
          supabase.from('employer_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('jobs').select('id').eq('employer_id', user.id)
        ]);

        const employerProfile = profileRes.data;
        const hasBasicInfo = !!profile?.full_name;
        const hasCompanyInfo = !!employerProfile?.company_name;
        const hasJobs = (jobsRes.data?.length || 0) > 0;

        setSteps([
          {
            id: 'basic',
            title: 'Complete Your Profile',
            description: 'Add your name and contact info',
            icon: <User className="h-5 w-5" />,
            route: '/employer/profile',
            completed: hasBasicInfo
          },
          {
            id: 'company',
            title: 'Company Information',
            description: 'Add company name and details',
            icon: <Building2 className="h-5 w-5" />,
            route: '/employer/company',
            completed: hasCompanyInfo
          },
          {
            id: 'job',
            title: 'Post Your First Job',
            description: 'Create a job listing to attract workers',
            icon: <Briefcase className="h-5 w-5" />,
            route: '/employer/post-job',
            completed: hasJobs
          }
        ]);
      }
    } catch (error) {
      console.error('Error checking onboarding progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;
  const isComplete = progress === 100;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (loading || dismissed || isComplete || steps.length === 0) return null;

  const nextStep = steps.find(s => !s.completed);

  return (
    <Card className="p-6 mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Complete Your Profile
            <Badge variant="secondary">{completedCount}/{steps.length}</Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complete these steps to unlock all features
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Progress value={progress} className="h-2 mb-4" />

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
              step.completed 
                ? 'bg-success/10 text-success' 
                : nextStep?.id === step.id 
                  ? 'bg-primary/10 cursor-pointer hover:bg-primary/20' 
                  : 'bg-muted/50 text-muted-foreground'
            }`}
            onClick={() => !step.completed && navigate(step.route)}
          >
            <div className={`p-2 rounded-full ${
              step.completed ? 'bg-success/20' : 'bg-background'
            }`}>
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                step.icon
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${step.completed ? 'line-through opacity-70' : ''}`}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            {!step.completed && nextStep?.id === step.id && (
              <ChevronRight className="h-5 w-5 text-primary" />
            )}
          </div>
        ))}
      </div>

      {nextStep && (
        <Button 
          className="w-full mt-4" 
          onClick={() => navigate(nextStep.route)}
        >
          Continue: {nextStep.title}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </Card>
  );
}
