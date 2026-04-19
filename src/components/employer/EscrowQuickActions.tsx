import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight, DollarSign, Percent, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EscrowQuickActionsProps {
  payments: any[];
}

export default function EscrowQuickActions({ payments }: EscrowQuickActionsProps) {
  const navigate = useNavigate();

  const escrowPayments = payments.filter(p => p.payment_type === 'escrow');
  const heldInEscrow = escrowPayments
    .filter(p => p.escrow_status === 'HELD')
    .reduce((sum, p) => sum + Number(p.net_amount || p.amount || 0), 0);
  const totalReleased = escrowPayments
    .filter(p => p.escrow_status === 'RELEASED')
    .reduce((sum, p) => sum + Number(p.net_amount || p.amount || 0), 0);
  const totalPlatformFees = escrowPayments
    .filter(p => p.escrow_status === 'RELEASED' || p.escrow_status === 'HELD')
    .reduce((sum, p) => sum + Number(p.platform_fee || 0), 0);
  const pendingReleaseCount = escrowPayments.filter(p => p.escrow_status === 'HELD').length;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <Card className="p-6 border-primary/20">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Escrow Payment System</h2>
            <p className="text-xs text-muted-foreground">1% platform fee • Secure worker payments</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate('/employer/escrow')}>
          Manage <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-lg bg-primary/10 text-center">
          <Shield className="h-4 w-4 text-primary mx-auto mb-1.5" />
          <p className="text-lg font-bold">{formatAmount(heldInEscrow)}</p>
          <p className="text-[10px] text-muted-foreground">Held in Escrow</p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 text-center">
          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatAmount(totalReleased)}</p>
          <p className="text-[10px] text-muted-foreground">Released</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
          <Percent className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{formatAmount(totalPlatformFees)}</p>
          <p className="text-[10px] text-muted-foreground">!% fee Per month</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/10 text-center">
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto mb-1.5" />
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{escrowPayments.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Transactions</p>
        </div>
      </div>

      {pendingReleaseCount > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">{pendingReleaseCount} payment{pendingReleaseCount > 1 ? 's' : ''} awaiting release</span>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate('/employer/escrow')}>
            Review Now
          </Button>
        </div>
      )}

      {escrowPayments.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">No escrow payments yet</p>
          <Button size="sm" onClick={() => navigate('/employer/escrow')}>
            Create First Payment
          </Button>
        </div>
      )}

      {escrowPayments.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Escrow Activity</p>
          {escrowPayments.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 text-sm">
              <div>
                <p className="font-medium">{p.description || 'Escrow Payment'}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <span className="font-bold">{formatAmount(Number(p.gross_amount || p.amount))}</span>
                <Badge className={
                  p.escrow_status === 'HELD' ? 'bg-primary' :
                  p.escrow_status === 'RELEASED' ? 'bg-green-500' :
                  'bg-muted'
                } variant={p.escrow_status === 'REFUNDED' ? 'secondary' : 'default'}>
                  {p.escrow_status === 'HELD' ? 'Held' : p.escrow_status === 'RELEASED' ? 'Released' : p.escrow_status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
