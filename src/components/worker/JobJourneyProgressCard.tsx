import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface JobFormality {
  id: string;
  job_id: string;
  application_id: string;
  contract_sent: boolean;
  contract_signed: boolean;
  ecr_check_status: string;
  medical_exam_status: string;
  police_verification_status: string;
  visa_status: string;
  flight_booking_status: string;
  overall_status: string;
  completion_percentage: number;
  expected_joining_date: string | null;
  jobs: {
    title: string;
    location: string;
    country: string;
  };
}

interface JobJourneyProgressCardProps {
  formalities: JobFormality[];
  onUpdate?: (formalities: JobFormality[]) => void;
}

export default function JobJourneyProgressCard({ formalities: initialFormalities, onUpdate }: JobJourneyProgressCardProps) {
  const [formalities, setFormalities] = useState<JobFormality[]>(initialFormalities);

  useEffect(() => {
    setFormalities(initialFormalities);
  }, [initialFormalities]);

  // Subscribe to real-time updates from employer
  useEffect(() => {
    if (formalities.length === 0) return;

    const formalityIds = formalities.map(f => f.id);
    
    const channel = supabase
      .channel('job-formalities-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'job_formalities',
          filter: `id=in.(${formalityIds.join(',')})`
        },
        async (payload) => {
          // Fetch the updated formality with job details
          const { data } = await supabase
            .from('job_formalities')
            .select(`
              *,
              jobs:job_id (
                title,
                location,
                country
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setFormalities(prev => {
              const updated = prev.map(f => 
                f.id === data.id ? data as JobFormality : f
              );
              onUpdate?.(updated);
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formalities.length]);

  if (!formalities || formalities.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? (
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      );
    }

    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'APPROVED':
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
      case 'IN_PROGRESS':
      case 'PENDING':
      case 'SUBMITTED':
        return <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
      case 'REJECTED':
      case 'FAILED':
        return <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
    }
  };

  const getStatusText = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? 'Completed' : 'Pending';
    }
    
    const statusUpper = status?.toUpperCase() || 'NOT_STARTED';
    switch (statusUpper) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'APPROVED':
      case 'CONFIRMED':
        return 'Completed';
      case 'IN_PROGRESS':
      case 'PENDING':
      case 'SUBMITTED':
        return 'In Progress';
      case 'REJECTED':
      case 'FAILED':
        return 'Action Required';
      default:
        return 'Not Started';
    }
  };

  return (
    <div className="space-y-4">
      {formalities.map((formality) => {
        // Use the completion_percentage from database (updated by employer)
        const progressPercentage = formality.completion_percentage || 0;
        
        const stages = [
          { label: 'Contract Signed', status: formality.contract_signed },
          { label: 'ECR Check', status: formality.ecr_check_status },
          { label: 'Medical Examination', status: formality.medical_exam_status },
          { label: 'Police Verification', status: formality.police_verification_status },
          { label: 'Visa Approval', status: formality.visa_status },
          { label: 'Flight Booking', status: formality.flight_booking_status }
        ];

        return (
          <Card key={formality.id} className="p-6">
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold">{formality.jobs.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formality.jobs.location}, {formality.jobs.country}
                  </p>
                  {formality.expected_joining_date && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Expected Joining: {new Date(formality.expected_joining_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">
                    {progressPercentage}%
                  </span>
                  <Badge 
                    variant={formality.overall_status === 'COMPLETED' ? 'default' : 'secondary'} 
                    className="ml-2"
                  >
                    {formality.overall_status?.replace(/_/g, ' ') || 'IN PROGRESS'}
                  </Badge>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div key={index} className="flex items-center gap-3">
                  {getStatusIcon(stage.status)}
                  <div className="flex-1">
                    <span className={
                      getStatusText(stage.status) === 'Completed'
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    }>
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {getStatusText(stage.status)}
                  </span>
                </div>
              ))}
            </div>

            {progressPercentage === 100 && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ All formalities completed! Ready for departure.
                </p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
