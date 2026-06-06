import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Home, LogIn, Menu, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const publicNav = [
  { path: '/emitra/register', label: 'Apply as Partner', icon: UserPlus },
  { path: '/emitra/login', label: 'Partner Login', icon: LogIn },
  { path: '/', label: 'Back to Home', icon: Home },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="space-y-0.5">
      {publicNav.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm',
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
      <Link to="/" className="flex items-center gap-2.5 mb-5 hover:opacity-80 transition-opacity shrink-0">
        <img src="/safework-global-logo.png" alt="SafeWorkGlobal" className="h-7 w-7" />
        <span className="text-lg font-bold text-foreground font-heading">SafeWorkGlobal</span>
      </Link>
      <div className="px-3 mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
          E-Mitra Portal
        </span>
      </div>
    </>
  );
}

export default function EmitraLayout({ children, title, subtitle }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Desktop sidebar — matches logged-in portal */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border min-h-screen p-4 lg:p-5 shrink-0">
        <SidebarBrand />
        <SidebarNav />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
          <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden shrink-0" aria-label="Open menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-4 pt-6">
                    <SidebarBrand />
                    <SidebarNav onNavigate={() => setMenuOpen(false)} />
                  </SheetContent>
                </Sheet>
              )}
              <div className="md:hidden flex items-center gap-2">
                <img src="/safework-global-logo.png" alt="SafeWorkGlobal" className="h-7 w-7" />
                <div>
                  <p className="text-sm font-bold font-heading leading-tight">SafeWorkGlobal</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">E-Mitra Portal</p>
                </div>
              </div>
              <Link
                to="/"
                className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← SafeWork Global Home
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden animate-in fade-in duration-300">
          {(title || subtitle) && (
            <div className="mb-6 md:mb-8 max-w-4xl">
              {title && (
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-1">{title}</h1>
              )}
              {subtitle && <p className="text-sm md:text-base text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          <div className="max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
