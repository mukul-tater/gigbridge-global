import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Verification {
  id: string;
  worker_id: string;
  verification_type: string;
  status: string;
  result: string | null;
  requested_at: string;
  completed_at: string | null;
  worker_name?: string;
}

interface BackgroundVerificationCardProps {
  verifications: Verification[];
  onRefresh: () => void;
}

export default function BackgroundVerificationCard({ verifications, onRefresh }: BackgroundVerificationCardProps) {
  const { toast } = useToast();
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const getStatusIcon = (status: string, result?: string | null) => {
    if (status === 'completed') {
      if (result === 'passed') return <CheckCircle className="h-4 w-4 text-green-500" />;
      if (result === 'failed') return <XCircle className="h-4 w-4 text-red-500" />;
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    if (status === 'in_progress') return <Clock className="h-4 w-4 text-blue-500" />;
    if (status === 'failed') return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string, result?: string | null) => {
    if (status === 'completed' && result === 'passed') {
      return <Badge className="bg-green-500">Verified</Badge>;
    }
    if (status === 'completed' && result === 'failed') {
      return <Badge variant="destructive">Failed</Badge>;
    }
    if (status === 'in_progress') {
      return <Badge variant="secondary">In Progress</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const requestVerification = async (workerId: string, verificationType: string) => {
    setIsRequesting(true);
    try {
      const { error } = await supabase.from('background_verifications').insert({
        worker_id: workerId,
        employer_id: (await supabase.auth.getUser()).data.user?.id,
        verification_type: verificationType,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Verification Requested",
        description: `${verificationType.replace('_', ' ')} verification has been requested.`
      });
      onRefresh();
    } catch (error) {
      console.error('Error requesting verification:', error);
      toast({
        title: "Error",
        description: "Failed to request verification.",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const verificationTypes = [
    { value: 'identity', label: 'Identity Verification' },
    { value: 'criminal_record', label: 'Criminal Record Check' },
    { value: 'employment_history', label: 'Employment History' },
    { value: 'education', label: 'Education Verification' },
    { value: 'reference_check', label: 'Reference Check' },
    { value: 'credit_check', label: 'Credit Check' }
  ];

  const pendingCount = verifications.filter(v => v.status === 'pending' || v.status === 'in_progress').length;
  const completedCount = verifications.filter(v => v.status === 'completed').length;
  const passedCount = verifications.filter(v => v.status === 'completed' && v.result === 'passed').length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Background Verifications</h2>
            <p className="text-sm text-muted-foreground">Worker verification status</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Request Verification</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Background Verification</DialogTitle>
              <DialogDescription>
                Select verification type for the worker
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {verificationTypes.map(type => (
                <Button
                  key={type.value}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => selectedWorker && requestVerification(selectedWorker, type.value)}
                  disabled={isRequesting}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-2xl font-bold">{verifications.length}</p>
          <p className="text-xs text-muted-foreground">Total Verifications</p>
        </div>
        <div className="p-4 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="p-4 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{passedCount}/{completedCount}</p>
          <p className="text-xs text-muted-foreground">Passed</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {verifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No background verifications requested yet</p>
          </div>
        ) : (
          verifications.slice(0, 5).map((verification) => (
            <div key={verification.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(verification.status, verification.result)}
                <div>
                  <p className="font-medium">{verification.verification_type.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested {new Date(verification.requested_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {getStatusBadge(verification.status, verification.result)}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
