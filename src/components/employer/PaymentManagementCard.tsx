import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_type: string;
  status: string;
  description: string | null;
  created_at: string;
  paid_at: string | null;
}

interface PaymentManagementCardProps {
  payments: Payment[];
}

export default function PaymentManagementCard({ payments }: PaymentManagementCardProps) {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const thisMonthSpent = payments
    .filter(p => {
      const paymentDate = new Date(p.created_at);
      const now = new Date();
      return p.status === 'completed' && 
             paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Payment Management</h2>
            <p className="text-sm text-muted-foreground">Track your spending</p>
          </div>
        </div>
        <Button onClick={() => navigate('/employer/payments')} size="sm">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
          <DollarSign className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{formatAmount(totalSpent, payments[0]?.currency || 'USD')}</p>
          <p className="text-xs text-muted-foreground">Total Spent</p>
        </div>
        <div className="p-4 bg-blue-500/10 rounded-lg">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatAmount(thisMonthSpent, payments[0]?.currency || 'USD')}
          </p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </div>
        <div className="p-4 bg-yellow-500/10 rounded-lg">
          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatAmount(pendingAmount, payments[0]?.currency || 'USD')}
          </p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No payment transactions yet</p>
          </div>
        ) : (
          payments.slice(0, 5).map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(payment.status)}
                <div>
                  <p className="font-medium">
                    {payment.description || payment.payment_type.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatAmount(Number(payment.amount), payment.currency)}</p>
                {getStatusBadge(payment.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
