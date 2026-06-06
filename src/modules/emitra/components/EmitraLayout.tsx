import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function EmitraLayout({ children, title, subtitle }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-white">
      <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">SafeWork Global</p>
              <p className="text-[10px] text-muted-foreground">E-Mitra Partner Portal</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/emitra/login" className="text-muted-foreground hover:text-primary">Login</Link>
            <Link
              to="/emitra/register"
              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90"
            >
              Apply
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && <h1 className="text-2xl md:text-3xl font-bold mb-1">{title}</h1>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
