import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Briefcase, HardHat, LogOut, UserCircle } from 'lucide-react';
import RegistrationLayout from '../components/RegistrationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { EXPERIENCE_OPTIONS } from '../types/worker.types';

export default function WorkerDashboardPage() {
  const navigate = useNavigate();
  const { worker, logout } = useWorkerAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!worker) return null;

  const experienceLabel =
    EXPERIENCE_OPTIONS.find((e) => e.value === worker.experienceLevel)?.label ?? worker.experienceLevel;

  return (
    <RegistrationLayout
      title={`Welcome, ${worker.fullName.split(' ')[0]}!`}
      subtitle="Your overseas job journey starts here"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Badge variant="secondary" className="text-sm">
          {worker.workerCode}
        </Badge>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              Profile Overview
            </CardTitle>
            <CardDescription>Your registration details</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ['Full Name', worker.fullName],
                ['Mobile', worker.mobileNumber],
                ['Location', `${worker.districtName}, ${worker.stateName}`],
                ['Primary Skill', worker.primarySkillName],
                ['Experience', experienceLabel],
                ['Status', worker.status.replace(/_/g, ' ')],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-muted/50 p-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Complete your profile to unlock more opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">
                {worker.profileCompletionPercentage}%
              </span>
            </div>
            <Progress value={worker.profileCompletionPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {worker.onboardingCompleted
                ? 'Your profile is complete. We will match you with overseas opportunities.'
                : "You've completed the minimum registration. Add documents and experience to increase your match score."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5 shadow-lg">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {worker.onboardingCompleted ? 'Profile completed' : 'Complete your profile'}
              </h3>
              <p className="text-muted-foreground">
                {worker.onboardingCompleted
                  ? 'Upload documents from your profile to reach 100% completion.'
                  : 'Complete your profile to access more overseas job opportunities.'}
              </p>
            </div>
          </div>
          <Button className="shrink-0" asChild>
            <Link to={worker.onboardingCompleted ? '/home' : '/onboarding'}>
              {worker.onboardingCompleted ? 'View Profile' : 'Complete Profile'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <HardHat className="h-4 w-4" />
        Registered via {worker.registrationSource} · {new Date(worker.createdDate).toLocaleDateString()}
      </div>
    </RegistrationLayout>
  );
}
