import { CheckCircle2, Circle } from 'lucide-react';
import { WORKER_STATUSES, WORKER_STATUS_LABELS } from '../config/constants';
import type { WorkerStatusHistory } from '../types/emitra.types';

interface Props {
  currentStatus: string;
  history: WorkerStatusHistory[];
}

export default function WorkerTimeline({ currentStatus, history }: Props) {
  const currentIdx = WORKER_STATUSES.indexOf(currentStatus as typeof WORKER_STATUSES[number]);
  const historyStatuses = new Set(history.map(h => h.status));

  return (
    <div className="space-y-0">
      {WORKER_STATUSES.map((status, idx) => {
        const done = idx <= currentIdx || historyStatuses.has(status);
        const active = status === currentStatus;
        return (
          <div key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                done ? 'bg-primary border-primary text-primary-foreground' : 'border-muted bg-background'
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
              </div>
              {idx < WORKER_STATUSES.length - 1 && (
                <div className={`w-0.5 h-8 ${done ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
            <div className="pb-6 pt-1">
              <p className={`text-sm font-medium ${active ? 'text-primary' : ''}`}>
                {WORKER_STATUS_LABELS[status]}
              </p>
              {history.find(h => h.status === status) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(history.find(h => h.status === status)!.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
