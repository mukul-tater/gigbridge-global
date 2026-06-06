import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, Construction, Home, Mail } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = 'Coming Soon',
  description = 'This feature is under development and will be available in a future release.',
}: ComingSoonProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-mesh)' }} />

      <div className="relative z-10 text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
          <Briefcase className="h-8 w-8 text-primary" />
        </div>

        <Badge className="bg-warning/10 text-warning border-warning/20 mb-4">
          <Construction className="h-3 w-3 mr-1" />
          Coming Soon
        </Badge>

        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-3">{title}</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">{description}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Mail className="h-4 w-4" />
              Contact Us
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
