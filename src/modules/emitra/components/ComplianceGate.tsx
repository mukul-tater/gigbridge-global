import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { acknowledgeCompliance } from '../services/emitraService';
import { toast } from 'sonner';

interface Props {
  partnerProfileId: string;
  onAcknowledged: () => void;
}

const RULES = [
  'I will NOT promise jobs or guarantee employment to workers.',
  'I will NOT guarantee visas or immigration outcomes.',
  'I will NOT collect unauthorized fees from workers.',
  'I will NOT modify or falsify worker documents.',
  'I understand that violations may result in account suspension.',
];

export default function ComplianceGate({ partnerProfileId, onAcknowledged }: Props) {
  const [checks, setChecks] = useState<boolean[]>(RULES.map(() => false));
  const [saving, setSaving] = useState(false);

  const allChecked = checks.every(Boolean);

  const handleSubmit = async () => {
    if (!allChecked) {
      toast.error('Please acknowledge all compliance rules');
      return;
    }
    setSaving(true);
    const { error } = await acknowledgeCompliance(partnerProfileId);
    setSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Compliance acknowledged. Welcome to your dashboard.');
    onAcknowledged();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Partner Compliance Agreement</h2>
            <p className="text-sm text-muted-foreground">Required before dashboard access</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {RULES.map((rule, i) => (
            <label key={rule} className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30">
              <Checkbox
                className="mt-0.5"
                checked={checks[i]}
                onCheckedChange={v => {
                  const next = [...checks];
                  next[i] = !!v;
                  setChecks(next);
                }}
              />
              <span className="text-sm">{rule}</span>
            </label>
          ))}
        </div>

        <Button className="w-full h-11" onClick={handleSubmit} disabled={!allChecked || saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          I Agree — Enter Dashboard
        </Button>
      </Card>
    </div>
  );
}
