import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Award, MapPin, Globe, ShieldCheck, Video, Languages, Briefcase, Check } from 'lucide-react';

export interface CompareWorker {
  id: string;
  full_name: string;
  avatar_url: string | null;
  nationality: string | null;
  current_location: string | null;
  primary_work_type: string | null;
  skill_level: string | null;
  years_of_experience: number | null;
  availability: string | null;
  has_passport: boolean;
  has_visa: boolean;
  has_video: boolean;
  certifications_count: number;
  verified_documents: string[];
  languages: string[];
  open_to_relocation: boolean;
  preferred_shift: string | null;
  ecr_status: string | null;
  skills: { skill_name: string }[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workers: CompareWorker[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const fields = [
  { key: 'role', label: 'Role', icon: Briefcase },
  { key: 'experience', label: 'Experience', icon: Award },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'nationality', label: 'Nationality', icon: Globe },
  { key: 'video', label: 'Intro Video', icon: Video },
  { key: 'docs', label: 'Verified Docs', icon: ShieldCheck },
  { key: 'certs', label: 'Certifications', icon: Award },
  { key: 'languages', label: 'Languages', icon: Languages },
  { key: 'shift', label: 'Preferred Shift', icon: Briefcase },
  { key: 'relocation', label: 'Open to Relocation', icon: MapPin },
  { key: 'ecr', label: 'ECR Status', icon: ShieldCheck },
  { key: 'skills', label: 'Top Skills', icon: Briefcase },
];

function renderValue(w: CompareWorker, key: string) {
  switch (key) {
    case 'role':
      return [w.primary_work_type, w.skill_level].filter(Boolean).join(' • ') || '—';
    case 'experience':
      return `${w.years_of_experience || 0} yrs`;
    case 'location':
      return w.current_location || '—';
    case 'nationality':
      return w.nationality || '—';
    case 'video':
      return w.has_video ? (
        <Badge className="bg-success/10 text-success border-success/20"><Check className="h-3 w-3 mr-1" />Available</Badge>
      ) : <span className="text-muted-foreground text-sm">—</span>;
    case 'docs':
      return w.verified_documents.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {w.verified_documents.map((d) => (
            <Badge key={d} variant="outline" className="text-xs capitalize">{d.replace('_', ' ')}</Badge>
          ))}
        </div>
      ) : <span className="text-muted-foreground text-sm">None</span>;
    case 'certs':
      return w.certifications_count > 0 ? `${w.certifications_count} certified` : '—';
    case 'languages':
      return w.languages.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {w.languages.slice(0, 4).map((l) => (
            <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
          ))}
        </div>
      ) : '—';
    case 'shift':
      return w.preferred_shift || 'Any';
    case 'relocation':
      return w.open_to_relocation ? 'Yes' : 'No';
    case 'ecr':
      return w.ecr_status ? <span className="capitalize">{w.ecr_status.replace('_', ' ')}</span> : '—';
    case 'skills':
      return w.skills.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {w.skills.slice(0, 4).map((s, i) => (
            <Badge key={i} variant="outline" className="text-xs">{s.skill_name}</Badge>
          ))}
        </div>
      ) : '—';
    default:
      return '—';
  }
}

export default function WorkerComparisonDrawer({ open, onOpenChange, workers, onRemove, onClearAll }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-[80vh]">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-heading">Compare Workers</SheetTitle>
              <SheetDescription>
                Side-by-side view of {workers.length} worker{workers.length !== 1 ? 's' : ''} (max 4)
              </SheetDescription>
            </div>
            {workers.length > 0 && (
              <Button variant="outline" size="sm" onClick={onClearAll}>Clear All</Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100%-100px)] mt-4">
          {workers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No workers to compare</p>
              <p className="text-sm text-muted-foreground">Tick the "Compare" box on worker cards to add them here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground w-40 sticky left-0 bg-background">Criteria</th>
                    {workers.map((w) => (
                      <th key={w.id} className="text-left py-3 px-4 min-w-[220px]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarImage src={w.avatar_url || ''} />
                              <AvatarFallback>{w.full_name?.[0] || 'W'}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-foreground truncate">{w.full_name}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onRemove(w.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, i) => (
                    <tr key={f.key} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                      <td className="py-3 px-4 font-medium text-muted-foreground sticky left-0 bg-inherit">
                        <div className="flex items-center gap-2">
                          <f.icon className="h-4 w-4" />
                          {f.label}
                        </div>
                      </td>
                      {workers.map((w) => (
                        <td key={w.id} className="py-3 px-4 align-top text-sm">{renderValue(w, f.key)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
