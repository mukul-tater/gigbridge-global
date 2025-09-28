import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Clock } from 'lucide-react';
import { debounce } from '@/lib/utils';

import BasicProfileStep from './steps/BasicProfileStep';
import KYCDocumentsStep from './steps/KYCDocumentsStep';
import SkillsStep from './steps/SkillsStep';
import WorkHistoryStep from './steps/WorkHistoryStep';
import LanguagesStep from './steps/LanguagesStep';
import PreferencesStep from './steps/PreferencesStep';
import ReviewStep from './steps/ReviewStep';

const STEPS = [
  { id: 1, title: 'Basic Profile', component: BasicProfileStep },
  { id: 2, title: 'KYC Documents', component: KYCDocumentsStep },
  { id: 3, title: 'Skills & Certifications', component: SkillsStep },
  { id: 4, title: 'Work History', component: WorkHistoryStep },
  { id: 5, title: 'Languages', component: LanguagesStep },
  { id: 6, title: 'Preferences', component: PreferencesStep },
  { id: 7, title: 'Review & Submit', component: ReviewStep },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingId, setOnboardingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepData, setStepData] = useState<any>({});
  const [stepValid, setStepValid] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [savingIndicator, setSavingIndicator] = useState<string>('');

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check for existing onboarding
      const { data: existing } = await supabase
        .from('worker_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        setOnboardingId(existing.id);
        setCurrentStep(existing.current_step);
        await loadExistingData(existing.id);
      } else {
        // Create new onboarding
        const { data: newOnboarding, error } = await supabase
          .from('worker_onboarding')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        setOnboardingId(newOnboarding.id);
      }
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize onboarding',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingData = async (onboardingId: string) => {
    try {
      // Load all existing data
      const [profile, documents, skills, workHistory, languages, preferences] = await Promise.all([
        supabase.from('worker_onboarding_profile').select('*').eq('onboarding_id', onboardingId).single(),
        supabase.from('worker_onboarding_documents').select('*').eq('onboarding_id', onboardingId),
        supabase.from('worker_onboarding_skills').select('*').eq('onboarding_id', onboardingId),
        supabase.from('worker_onboarding_work_history').select('*').eq('onboarding_id', onboardingId),
        supabase.from('worker_onboarding_languages').select('*').eq('onboarding_id', onboardingId),
        supabase.from('worker_onboarding_preferences').select('*').eq('onboarding_id', onboardingId).single(),
      ]);

      const loadedData = {
        profile: profile.data || {},
        documents: documents.data || [],
        skills: skills.data || [],
        workHistory: workHistory.data || [],
        languages: languages.data || [],
        preferences: preferences.data || {},
      };
      
      setStepData(loadedData);
      
      // Mark steps as completed based on loaded data
      const completed = new Set<number>();
      if (profile.data?.full_name) completed.add(1);
      if (documents.data?.length > 0) completed.add(2);
      if (skills.data?.length > 0) completed.add(3);
      if (workHistory.data?.length > 0) completed.add(4);
      if (languages.data?.length > 0) completed.add(5);
      if (preferences.data?.availability_date) completed.add(6);
      
      setCompletedSteps(completed);
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const saveStepData = async (step: number, data: any) => {
    try {
      switch (step) {
        case 1: // Basic Profile
          await supabase
            .from('worker_onboarding_profile')
            .upsert({ onboarding_id: onboardingId, ...data });
          break;
        case 2: // Documents are handled separately in the component
          break;
        case 3: // Skills
          // Delete existing and insert new
          await supabase.from('worker_onboarding_skills').delete().eq('onboarding_id', onboardingId);
          if (data.skills?.length) {
            await supabase.from('worker_onboarding_skills').insert(
              data.skills.map((skill: any) => ({ onboarding_id: onboardingId, ...skill }))
            );
          }
          break;
        case 4: // Work History
          await supabase.from('worker_onboarding_work_history').delete().eq('onboarding_id', onboardingId);
          if (data.jobs?.length) {
            await supabase.from('worker_onboarding_work_history').insert(
              data.jobs.map((job: any) => ({ onboarding_id: onboardingId, ...job }))
            );
          }
          break;
        case 5: // Languages
          await supabase.from('worker_onboarding_languages').delete().eq('onboarding_id', onboardingId);
          if (data.languages?.length) {
            await supabase.from('worker_onboarding_languages').insert(
              data.languages.map((lang: any) => ({ onboarding_id: onboardingId, ...lang }))
            );
          }
          break;
        case 6: // Preferences
          await supabase
            .from('worker_onboarding_preferences')
            .upsert({ onboarding_id: onboardingId, ...data });
          break;
      }

      // Update current step
      await supabase
        .from('worker_onboarding')
        .update({ current_step: Math.max(step + 1, currentStep) })
        .eq('id', onboardingId);

    } catch (error) {
      console.error('Error saving step data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress',
        variant: 'destructive',
      });
    }
  };

  const debouncedSave = useCallback(
    debounce((step: number, data: any) => {
      if (onboardingId) {
        setSavingIndicator('Saving...');
        saveStepData(step, data).then(() => {
          setSavingIndicator('Saved');
          setTimeout(() => setSavingIndicator(''), 2000);
        });
      }
    }, 800),
    [onboardingId, saveStepData]
  );

  const handleStepComplete = (step: number, data: any) => {
    setStepData(prev => ({ ...prev, [getStepKey(step)]: data }));
    setStepValid(prev => ({ ...prev, [step]: true }));
    setCompletedSteps(prev => new Set([...prev, step]));
    
    // Autosave with debounce
    debouncedSave(step, data);
  };


  const getStepKey = (step: number) => {
    const keys = ['', 'profile', 'documents', 'skills', 'workHistory', 'languages', 'preferences', 'review'];
    return keys[step];
  };

  const canNavigateToStep = (step: number) => {
    // Can navigate to current step, completed steps, or next step if current is valid
    return step <= currentStep || completedSteps.has(step) || (step === currentStep + 1 && stepValid[currentStep]);
  };

  const handleStepClick = (step: number) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="bg-card border-b p-4 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Worker Onboarding</h1>
            <div className="flex items-center gap-3">
              {savingIndicator && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  {savingIndicator === 'Saving...' ? (
                    <Clock className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  )}
                  {savingIndicator}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {STEPS.length}
              </span>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Stepper */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {STEPS.map((step) => {
                  const isCompleted = completedSteps.has(step.id);
                  const isCurrent = step.id === currentStep;
                  const canNavigate = canNavigateToStep(step.id);
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : isCompleted
                          ? 'bg-green-50 text-green-700 border border-green-200 cursor-pointer hover:bg-green-100'
                          : canNavigate
                          ? 'bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80'
                          : 'text-muted-foreground cursor-not-allowed'
                      }`}
                      onClick={() => handleStepClick(step.id)}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCurrent
                            ? 'bg-primary-foreground text-primary'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : canNavigate
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-muted-foreground/20 text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? '✓' : step.id}
                      </div>
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CurrentStepComponent
                  data={stepData[getStepKey(currentStep)] || {}}
                  onComplete={(data: any) => handleStepComplete(currentStep, data)}
                  onValidationChange={(isValid: boolean) => 
                    setStepValid(prev => ({ ...prev, [currentStep]: isValid }))
                  }
                  onboardingId={onboardingId}
                  allData={stepData}
                  onNavigateToStep={handleStepClick}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}