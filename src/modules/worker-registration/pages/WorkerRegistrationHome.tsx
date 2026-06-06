import { Navigate } from 'react-router-dom';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, HardHat, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-16 sm:px-6">
        <header className="mb-8 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/safework-global-logo.png" alt="SafeWork Global" className="h-12 w-12 rounded-xl" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">SafeWork Global</p>
              <p className="text-sm text-white/70">Overseas Blue-Collar Recruitment</p>
            </div>
          </Link>
        </header>

        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Your gateway to overseas jobs
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/80">
          Register in under 1 minute. Get matched with verified overseas employers looking for skilled blue-collar workers.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link to="/register">
              Register as Worker
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 border-white/30 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Globe, title: 'Global Opportunities', desc: 'Jobs in Gulf, Europe & beyond' },
            { icon: ShieldCheck, title: 'Verified Employers', desc: 'Trusted recruitment partners' },
            { icon: HardHat, title: '14+ Trade Skills', desc: 'Welder, Electrician, Mason & more' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <Icon className="mb-3 h-6 w-6 text-blue-300" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-white/70">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
