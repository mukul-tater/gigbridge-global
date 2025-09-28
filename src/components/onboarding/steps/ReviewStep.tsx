import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  User, FileText, Briefcase, Languages, MapPin, DollarSign,
  Calendar, Edit, CheckCircle, AlertCircle, Clock, Send
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ReviewStepProps {
  data: any;
  onComplete: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
  onboardingId: string | null;
  allData: any;
}

export default function ReviewStep({ 
  data, 
  onComplete, 
  onValidationChange, 
  onboardingId,
  allData
}: ReviewStepProps) {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);

  useEffect(() => {
    loadOnboardingData();
  }, [onboardingId]);

  useEffect(() => {
    const hasRequiredDocs = allData.documents?.some((doc: any) => doc.document_type === 'aadhaar_front') &&
                           allData.documents?.some((doc: any) => doc.document_type === 'aadhaar_back') &&
                           allData.documents?.some((doc: any) => doc.document_type === 'pan');
    
    const isValid = termsAccepted && hasRequiredDocs && allData.profile && allData.skills?.length > 0;
    onValidationChange(isValid);
  }, [termsAccepted, allData, onValidationChange]);

  const loadOnboardingData = async () => {
    if (!onboardingId) return;

    try {
      const [profile, documents, skills, certifications, workHistory, languages, preferences] = await Promise.all([
        supabase.from('worker_onboarding_profile').select('*').eq('onboarding_id', onboardingId).single(),
        supabase.from('worker_onboarding_documents').select('*').eq('onboarding_id', onboardingId),
        supabase.from('worker_onboarding_skills').select('*').eq('onboarding_id', onboardingId),
        supabase.from('worker_onboarding_certifications').select('*').eq('onboarding_id', onboardingId),
        supabase.from('worker_onboarding_work_history').select('*').eq('onboarding_id', onboardingId),
        supabase.from('worker_onboarding_languages').select('*').eq('onboarding_id', onboardingId),
        supabase.from('worker_onboarding_preferences').select('*').eq('onboarding_id', onboardingId).single(),
      ]);

      setOnboardingData({
        profile: profile.data,
        documents: documents.data || [],
        skills: skills.data || [],
        certifications: certifications.data || [],
        workHistory: workHistory.data || [],
        languages: languages.data || [],
        preferences: preferences.data,
      });
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    }
  };

  const maskValue = (value: string, type: 'pan' | 'aadhaar') => {
    if (!value) return '';
    
    if (type === 'pan') {
      // PAN format: AAAPL1234C -> AA***1234*
      if (value.length === 10) {
        return `${value.substring(0, 2)}***${value.substring(5, 9)}*`;
      }
    } else if (type === 'aadhaar') {
      // Aadhaar format: 123456789012 -> XXXX-XXXX-1234
      if (value.length === 12) {
        return `XXXX-XXXX-${value.substring(8)}`;
      }
    }
    
    return value;
  };

  const handleSubmit = async () => {
    if (!onboardingId || submitting) return;

    setSubmitting(true);
    try {
      // Update onboarding status to pending verification
      const { error } = await supabase
        .from('worker_onboarding')
        .update({ 
          status: 'pending_verification',
          submitted_at: new Date().toISOString()
        })
        .eq('id', onboardingId);

      if (error) throw error;

      // Create audit log
      await supabase.from('onboarding_audit_logs').insert({
        actor_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'onboarding_submitted',
        entity_type: 'worker_onboarding',
        entity_id: onboardingId,
        metadata: { submitted_at: new Date().toISOString() }
      });

      toast({
        title: 'Onboarding Submitted!',
        description: 'Your application has been submitted for verification. We\'ll notify you once the review is complete.',
      });

      // Navigate to dashboard or success page
      navigate('/dashboard');

    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit your onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!onboardingData) {
    return <div className="text-center py-8">Loading review data...</div>;
  }

  const { profile, documents, skills, certifications, workHistory, languages, preferences } = onboardingData;

  const getDocumentStatus = (docType: string) => {
    return documents.find((doc: any) => doc.document_type === docType);
  };

  const requiredDocsComplete = ['aadhaar_front', 'aadhaar_back', 'pan'].every(type => 
    getDocumentStatus(type)
  );

  return (
    <div className="space-y-6">
      {/* Submission Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="font-semibold">Ready for Submission</h3>
              <p className="text-sm text-muted-foreground">
                Review all your information below and submit for verification
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Profile
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile?.profile_photo_url && (
            <img
              src={profile.profile_photo_url}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Full Name:</span>
              <p>{profile?.full_name}</p>
            </div>
            <div>
              <span className="font-medium">Date of Birth:</span>
              <p>{profile?.date_of_birth}</p>
            </div>
            <div>
              <span className="font-medium">Phone:</span>
              <p>{profile?.phone}</p>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <p>{profile?.email}</p>
            </div>
            {profile?.gender && (
              <div>
                <span className="font-medium">Gender:</span>
                <p className="capitalize">{profile.gender.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KYC Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            KYC Documents
          </CardTitle>
          <div className="flex items-center gap-2">
            {requiredDocsComplete ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['aadhaar_front', 'aadhaar_back', 'pan', 'passport', 'visa'].map(docType => {
              const doc = getDocumentStatus(docType);
              const isRequired = ['aadhaar_front', 'aadhaar_back', 'pan'].includes(docType);
              
              return (
                <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">
                      {docType.replace('_', ' ')}
                      {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    {doc && (
                      <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                    )}
                  </div>
                  {doc ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isRequired ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
          
          {!requiredDocsComplete && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                Please upload all required documents (Aadhaar front, back, and PAN) before submitting.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Skills & Experience
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill.skill_name} ({skill.experience_years} years)
                  </Badge>
                ))}
              </div>
            </div>
            
            {certifications.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Certifications</h4>
                {certifications.map((cert: any, index: number) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-muted-foreground">{cert.issuer} • {cert.issue_date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work History */}
      {workHistory.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Work History
            </CardTitle>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {workHistory.map((job: any, index: number) => (
              <div key={index} className="border-l-2 border-muted pl-4 pb-4 last:pb-0">
                <h4 className="font-medium">{job.role}</h4>
                <p className="text-sm text-muted-foreground">{job.company_name}</p>
                <p className="text-sm text-muted-foreground">
                  {job.start_date} - {job.is_current ? 'Present' : job.end_date}
                </p>
                {job.responsibilities && (
                  <p className="text-sm mt-1">{job.responsibilities}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Languages
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang: any, index: number) => (
              <Badge key={index} variant="outline">
                {lang.language_name} - {lang.proficiency}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Work Preferences
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-medium">Preferred Countries:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {preferences?.preferred_countries?.map((country: string, index: number) => (
                <Badge key={index} variant="secondary">{country}</Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Expected Wage:</span>
              <p>{preferences?.expected_wage_currency} {preferences?.expected_wage_amount}/month</p>
            </div>
            <div>
              <span className="font-medium">Contract Length:</span>
              <p>{preferences?.contract_length}</p>
            </div>
            <div>
              <span className="font-medium">Available From:</span>
              <p>{preferences?.availability_date}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              I confirm that all the information provided is accurate and the documents uploaded are authentic and belong to me. I consent to the verification of my KYC documents and understand that providing false information may result in rejection of my application.
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!termsAccepted || !requiredDocsComplete || submitting}
          className="px-8 py-3"
          size="lg"
        >
          {submitting ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit for Verification
            </>
          )}
        </Button>
      </div>
    </div>
  );
}