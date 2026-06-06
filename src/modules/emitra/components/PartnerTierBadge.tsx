import { Badge } from '@/components/ui/badge';
import { PARTNER_TIER_LABELS } from '../config/constants';
import type { PartnerTier } from '../types/emitra.types';

const TIER_STYLES: Record<PartnerTier, string> = {
  bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  silver: 'bg-slate-100 text-slate-700 border-slate-300',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  platinum: 'bg-violet-100 text-violet-800 border-violet-300',
};

export default function PartnerTierBadge({ tier }: { tier: PartnerTier | string | null }) {
  const t = (tier || 'bronze') as PartnerTier;
  return (
    <Badge variant="outline" className={TIER_STYLES[t]}>
      {PARTNER_TIER_LABELS[t]} Partner
    </Badge>
  );
}
