import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  User, FileText, CheckCircle, Clock, AlertCircle, 
  ArrowRight, Edit, Building, MapPin 
} from 'lucide-react';

interface OnboardingStatus {
  status: 'not_started' | 'draft' | 'pending_verification' | 'verified' | 'rejected';
  completionPercentage: number;
  currentStep: number;
  onboardingId?: string;
  profile?: any;
  documents?: any[];
  submittedAt?: string;
  verifiedAt?: string;
}

export default function ProfileCompletion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    status: 'not_started',
    completionPercentage: 0,
    currentStep: 1,
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check for existing onboarding
      const { data: onboarding } = await supabase
        .from('worker_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!onboarding) {
        setOnboardingStatus({
          status: 'not_started',
          completionPercentage: 0,
          currentStep: 1,
        });
        setLoading(false);
        return;
      }

      // Load related data
      const [profile, documents, skills, workHistory, languages, preferences] = await Promise.all([
        supabase.from('worker_onboarding_profile').select('*').eq('onboarding_id', onboarding.id).single(),
        supabase.from('worker_onboarding_documents').select('*').eq('onboarding_id', onboarding.id),
        supabase.from('worker_onboarding_skills').select('*').eq('onboarding_id', onboarding.id),
        supabase.from('worker_onboarding_work_history').select('*').eq('onboarding_id', onboarding.id),
        supabase.from('worker_onboarding_languages').select('*').eq('onboarding_id', onboarding.id),
        supabase.from('worker_onboarding_preferences').select('*').eq('onboarding_id', onboarding.id).single(),
      ]);

      // Calculate completion percentage
      const completionSteps = [
        profile.data ? 15 : 0, // Basic profile
        documents.data?.length >= 3 ? 25 : (documents.data?.length || 0) * 8, // KYC docs (3 required)
        skills.data?.length > 0 ? 15 : 0, // Skills
        workHistory.data?.length > 0 ? 10 : 0, // Work history (optional)
        languages.data?.length > 0 ? 10 : 0, // Languages
        preferences.data ? 15 : 0, // Preferences
        onboarding.status === 'pending_verification' || onboarding.status === 'verified' ? 10 : 0, // Submitted
      ];

      const completionPercentage = completionSteps.reduce((sum, step) => sum + step, 0);

      setOnboardingStatus({
        status: onboarding.status,
        completionPercentage,
        currentStep: onboarding.current_step,
        onboardingId: onboarding.id,
        profile: profile.data,
        documents: documents.data || [],
        submittedAt: onboarding.submitted_at,
        verifiedAt: onboarding.verified_at,
      });

    } catch (error) {
      console.error('Error checking onboarding status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (onboardingStatus.status) {
      case 'not_started':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Not Started</Badge>;
      case 'draft':
        return <Badge variant="outline"><Edit className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'pending_verification':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (onboardingStatus.status) {
      case 'not_started':
        return {
          title: 'Complete Your Profile',
          description: 'Start your worker onboarding to access job opportunities',
          action: 'Start Onboarding',
          actionFn: () => navigate('/onboarding'),
        };
      case 'draft':
        return {
          title: 'Continue Your Onboarding',
          description: `You're ${onboardingStatus.completionPercentage}% complete. Continue where you left off.`,
          action: 'Continue',
          actionFn: () => navigate('/onboarding'),
        };
      case 'pending_verification':
        return {
          title: 'Verification in Progress',
          description: 'Your documents are being reviewed. We\'ll notify you once verification is complete.',
          action: 'View Details',
          actionFn: () => navigate('/onboarding'),
        };
      case 'verified':
        return {
          title: 'Profile Verified!',
          description: 'Congratulations! Your profile is verified and you can now apply for jobs.',
          action: 'Browse Jobs',
          actionFn: () => navigate('/dashboard'), // Assuming dashboard has job listings
        };
      case 'rejected':
        return {
          title: 'Verification Issues',
          description: 'There were issues with your verification. Please review and resubmit.',
          action: 'Review & Fix',
          actionFn: () => navigate('/onboarding'),
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">Manage your worker profile and onboarding status</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Main Status Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {statusInfo?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{statusInfo?.description}</p>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile Completion</span>
              <span>{onboardingStatus.completionPercentage}%</span>
            </div>
            <Progress value={onboardingStatus.completionPercentage} className="w-full" />
          </div>

          {statusInfo && (
            <Button onClick={statusInfo.actionFn} className="w-full sm:w-auto">
              {statusInfo.action}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Profile Details */}
      {onboardingStatus.profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                {onboardingStatus.profile.profile_photo_url && (
                  <img
                    src={onboardingStatus.profile.profile_photo_url}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{onboardingStatus.profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{onboardingStatus.profile.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p>{onboardingStatus.profile.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <p>{new Date(onboardingStatus.profile.date_of_birth).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                KYC Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['aadhaar_front', 'aadhaar_back', 'pan', 'passport', 'visa'].map(docType => {
                  const doc = onboardingStatus.documents?.find(d => d.document_type === docType);
                  const isRequired = ['aadhaar_front', 'aadhaar_back', 'pan'].includes(docType);
                  
                  return (
                    <div key={docType} className="flex items-center justify-between py-1">
                      <span className="text-sm capitalize">
                        {docType.replace('_', ' ')}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      {doc ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isRequired ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => navigate('/onboarding')}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <Building className="w-4 h-4 mr-2" />
              View Jobs
            </Button>
            <Button variant="outline" onClick={() => navigate('/alerts')}>
              <MapPin className="w-4 h-4 mr-2" />
              Job Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {onboardingStatus.status !== 'not_started' && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Onboarding Started</p>
                  <p className="text-xs text-muted-foreground">Profile creation initiated</p>
                </div>
              </div>
              
              {onboardingStatus.submittedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Submitted for Verification</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(onboardingStatus.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {onboardingStatus.verifiedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Profile Verified</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(onboardingStatus.verifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}