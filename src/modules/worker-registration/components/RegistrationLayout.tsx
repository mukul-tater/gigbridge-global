import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Briefcase, Home, LogIn, Menu, ShieldCheck, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface RegistrationLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Center content vertically — ideal for login */
  centered?: boolean;
  maxWidth?: 'md' | 'lg' | '2xl' | '3xl';
}

const publicNav = [
  { path: '/register', label: 'Worker Registration', icon: UserPlus },
  { path: '/login', label: 'Worker Login', icon: LogIn },
  { path: '/', label: 'Back to Home', icon: Home },
] as const;

const maxWidthClass = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
} as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {publicNav.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', !isActive && 'opacity-70')} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <>
      <Link to="/" className="flex items-center gap-2.5 mb-6 hover:opacity-80 transition-opacity shrink-0">
        <img src="/safework-global-logo.png" alt="SafeWork Global" className="h-8 w-8 rounded-lg" />
        <div>
          <span className="text-base font-bold text-foreground font-heading leading-tight block">SafeWork Global</span>
          <span className="text-[11px] text-muted-foreground">Worker Portal</span>
        </div>
      </Link>
      <div className="px-1 mb-4">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground/80 font-semibold">
          Overseas Jobs
        </span>
      </div>
    </>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto pt-6 border-t border-border space-y-4">
      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 space-y-2.5">
        {[
          { icon: Briefcase, text: 'Verified overseas job listings' },
          { icon: ShieldCheck, text: 'Government-compliant recruitment' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
            <Icon className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegistrationLayout({
  title,
  subtitle,
  children,
  footer,
  centered = false,
  maxWidth = '2xl',
}: RegistrationLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background w-full">
      <aside className="hidden md:flex flex-col w-[260px] bg-card border-r border-border min-h-screen p-5 shrink-0">
        <SidebarBrand />
        <SidebarNav />
        <SidebarFooter />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: 'var(--gradient-mesh)' }}
          aria-hidden
        />

        <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden shrink-0" aria-label="Open menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-5 flex flex-col">
                    <SidebarBrand />
                    <SidebarNav onNavigate={() => setMenuOpen(false)} />
                    <SidebarFooter />
                  </SheetContent>
                </Sheet>
              )}
              <div className="md:hidden flex items-center gap-2">
                <img src="/safework-global-logo.png" alt="SafeWork Global" className="h-7 w-7 rounded-md" />
                <span className="text-sm font-bold font-heading">Worker Portal</span>
              </div>
              <Link
                to="/"
                className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to SafeWork Global
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main
          className={cn(
            'relative z-10 flex-1 px-4 py-6 md:px-8 md:py-8 overflow-x-hidden',
            centered && 'flex flex-col items-center justify-center',
          )}
        >
          <div className={cn('w-full mx-auto', maxWidthClass[maxWidth])}>
            <div className={cn('mb-6 md:mb-8', centered && 'text-center')}>
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground tracking-tight mb-2">
                {title}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                {subtitle}
              </p>
            </div>
            {children}
            {footer && (
              <div className={cn('mt-6 text-sm text-muted-foreground', centered && 'text-center')}>
                {footer}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
