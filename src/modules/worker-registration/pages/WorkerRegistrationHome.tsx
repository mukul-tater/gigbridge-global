import { Navigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  LogIn,
  Search,
  UserPlus,
} from 'lucide-react';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import RegistrationLayout from '../components/RegistrationLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import heroImage from '@/assets/hero-workers.jpg';

const STEPS = [
  {
    step: 1,
    title: 'Create your account',
    desc: 'Mobile OTP, email, and password — under a minute.',
  },
  {
    step: 2,
    title: 'Complete your profile',
    desc: 'Add skills, location, and documents when you are ready.',
  },
  {
    step: 3,
    title: 'Apply to verified jobs',
    desc: 'Browse overseas roles and track your application status.',
  },
] as const;

export default function WorkerRegistrationHome() {
  const { isAuthenticated, loading } = useWorkerAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <RegistrationLayout
      maxWidth="3xl"
      title="Find overseas jobs"
      subtitle="Join SafeWork Global as a worker to apply for verified placements in the Gulf, Europe, and beyond."
      footer={
        <p className="text-center pt-4 border-t border-border">
          Want to look around first?{' '}
          <Link to="/jobs" className="font-medium text-primary hover:underline">
            Browse open jobs
          </Link>
        </p>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="border-border/60 shadow-lg overflow-hidden flex-1">
            <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-cyan-500" />
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold font-heading">New worker?</h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Create a free account to apply for jobs and save your profile.
              </p>
              <Button size="lg" className="mt-6 w-full h-11 font-medium" asChild>
                <Link to="/register">
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <LogIn className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold font-heading">Already registered?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in with your mobile, email, or Google.
              </p>
              <Button variant="outline" size="lg" className="mt-4 w-full h-11" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-3 border-border/60 shadow-lg overflow-hidden">
          <div className="relative h-40 sm:h-48 overflow-hidden">
            <img
              src={heroImage}
              alt="Skilled workers"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                Worker portal
              </p>
              <p className="text-sm font-medium text-foreground">
                Welder · Electrician · Mason · Driver · HVAC & more
              </p>
            </div>
          </div>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-base font-semibold font-heading mb-5">How it works</h2>
            <ol className="space-y-5">
              {STEPS.map(({ step, title, desc }) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {step}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="secondary" size="sm" className="gap-1.5" asChild>
                <Link to="/jobs">
                  <Search className="h-3.5 w-3.5" />
                  Browse jobs
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" asChild>
                <Link to="/job-categories">
                  <Briefcase className="h-3.5 w-3.5" />
                  Job categories
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" asChild>
                <Link to="/">
                  <ClipboardList className="h-3.5 w-3.5" />
                  About SafeWork
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RegistrationLayout>
  );
}
