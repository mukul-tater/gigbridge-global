import { Link } from 'react-router-dom';

interface RegistrationLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function RegistrationLayout({ title, subtitle, children, footer }: RegistrationLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src="/safework-global-logo.png"
              alt="SafeWork Global"
              className="h-11 w-11 rounded-xl shadow-lg"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">SafeWork Global</p>
              <p className="text-xs text-muted-foreground">Overseas Blue-Collar Recruitment</p>
            </div>
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-6 text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            </div>
            {children}
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
