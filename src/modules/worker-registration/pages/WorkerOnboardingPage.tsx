import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CheckCircle2, ChevronLeft, ChevronRight, Globe, Loader2, MapPin, Briefcase, Settings2,
} from 'lucide-react';
import RegistrationLayout from '../components/RegistrationLayout';
import FormField from '../components/FormField';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { workerApi } from '../services/workerApi';
import type { Skill } from '../types/worker.types';
import type { WorkerOnboardingData } from '../types/onboarding.types';
import {
  AVAILABILITY_OPTIONS, ECR_OPTIONS, GENDER_OPTIONS, LANGUAGE_OPTIONS,
  ONBOARDING_STEPS, PREFERRED_COUNTRIES, SALARY_CURRENCIES,
} from '../types/onboarding.types';

const STEP_ICONS = [MapPin, Briefcase, Settings2];

export default function WorkerOnboardingPage() {
  const navigate = useNavigate();
  const { token, worker, updateWorker } = useWorkerAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Step 1
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Step 2
  const [secondarySkillIds, setSecondarySkillIds] = useState<number[]>([]);
  const [previousEmployer, setPreviousEmployer] = useState('');
  const [hasPassport, setHasPassport] = useState(false);
  const [passportNumber, setPassportNumber] = useState('');
  const [ecrStatus, setEcrStatus] = useState('');

  // Step 3
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [openToRelocation, setOpenToRelocation] = useState(true);
  const [expectedSalaryMin, setExpectedSalaryMin] = useState('');
  const [expectedSalaryCurrency, setExpectedSalaryCurrency] = useState('INR');
  const [languages, setLanguages] = useState<string[]>(['Hindi']);

  useEffect(() => {
    if (!token || !worker) return;

    if (worker.onboardingCompleted) {
      navigate('/home', { replace: true });
      return;
    }

    Promise.all([
      workerApi.getOnboarding(token),
      workerApi.getReferenceData(),
    ])
      .then(([onboarding, ref]) => {
        applyOnboarding(onboarding);
        setSkills(ref.skills.filter((s) => s.id !== worker.primarySkillId));
        setStep(Math.min(onboarding.currentStep, 3));
      })
      .catch(() => toast.error('Failed to load onboarding data'))
      .finally(() => setLoading(false));
  }, [token, worker, navigate]);

  const applyOnboarding = (data: WorkerOnboardingData) => {
    if (data.dateOfBirth) setDateOfBirth(data.dateOfBirth);
    if (data.gender) setGender(data.gender);
    if (data.email) setEmail(data.email);
    if (data.address) setAddress(data.address);
    if (data.pincode) setPincode(data.pincode);
    setSecondarySkillIds(data.secondarySkillIds);
    if (data.previousEmployer) setPreviousEmployer(data.previousEmployer);
    setHasPassport(data.hasPassport);
    if (data.passportNumber) setPassportNumber(data.passportNumber);
    if (data.ecrStatus) setEcrStatus(data.ecrStatus);
    setPreferredCountries(data.preferredCountries);
    if (data.availability) setAvailability(data.availability);
    setOpenToRelocation(data.openToRelocation);
    if (data.expectedSalaryMin) setExpectedSalaryMin(String(data.expectedSalaryMin));
    setExpectedSalaryCurrency(data.expectedSalaryCurrency || 'INR');
    if (data.languages.length) setLanguages(data.languages);
  };

  const toggleSkill = (id: number) => {
    setSecondarySkillIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const toggleCountry = (country: string) => {
    setPreferredCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : prev.length < 5 ? [...prev, country] : prev
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? (prev.length > 1 ? prev.filter((l) => l !== lang) : prev) : [...prev, lang]
    );
  };

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!dateOfBirth) return 'Date of birth is required';
      if (!gender) return 'Gender is required';
      if (address.trim().length < 10) return 'Address must be at least 10 characters';
      if (!/^[1-9]\d{5}$/.test(pincode)) return 'Enter a valid 6-digit pincode';
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email';
    }
    if (step === 2) {
      if (!ecrStatus) return 'ECR status is required';
      if (hasPassport && passportNumber.trim().length < 6) return 'Passport number is required';
    }
    if (step === 3) {
      if (preferredCountries.length === 0) return 'Select at least one preferred country';
      if (!availability) return 'Availability is required';
      if (languages.length === 0) return 'Select at least one language';
    }
    return null;
  };

  const saveCurrentStep = async (): Promise<boolean> => {
    if (!token) return false;
    const error = validateStep();
    if (error) {
      toast.error(error);
      return false;
    }

    setSaving(true);
    try {
      if (step === 1) {
        await workerApi.saveOnboardingStep(token, {
          step: 1, dateOfBirth, gender, email, address, pincode,
        });
      } else if (step === 2) {
        await workerApi.saveOnboardingStep(token, {
          step: 2, secondarySkillIds, previousEmployer, hasPassport,
          passportNumber: hasPassport ? passportNumber : undefined, ecrStatus,
        });
      } else {
        const result = await workerApi.completeOnboarding(token, {
          step: 3, preferredCountries, availability, openToRelocation,
          expectedSalaryMin: expectedSalaryMin ? Number(expectedSalaryMin) : undefined,
          expectedSalaryCurrency, languages,
        });
        updateWorker(result.worker);
        toast.success('Profile completed! You are now job-ready.');
        navigate('/home', { replace: true });
        return true;
      }
      await refreshWorkerProfile();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const refreshWorkerProfile = async () => {
    if (!token || !worker) return;
    const updated = await workerApi.getProfile(worker.id, token);
    updateWorker(updated);
  };

  const handleNext = async () => {
    const ok = await saveCurrentStep();
    if (ok && step < 3) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  if (loading || !worker) {
    return (
      <RegistrationLayout title="Complete Your Profile" subtitle="Loading...">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RegistrationLayout>
    );
  }

  const progress = (step / ONBOARDING_STEPS.length) * 100;

  return (
    <RegistrationLayout
      title="Complete Your Profile"
      subtitle={`Step ${step} of ${ONBOARDING_STEPS.length} — ${ONBOARDING_STEPS[step - 1].title}`}
    >
      <div className="mb-6 flex items-center gap-2">
        {ONBOARDING_STEPS.map((s) => {
          const Icon = STEP_ICONS[s.id - 1];
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step > s.id ? 'bg-green-500 text-white' :
                  step === s.id ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}
              >
                {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              {s.id < ONBOARDING_STEPS.length && (
                <div className={`mx-1 h-0.5 flex-1 ${step > s.id ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>
      <Progress value={progress} className="mb-6 h-2" />

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>{ONBOARDING_STEPS[step - 1].title}</CardTitle>
          <CardDescription>
            {step === 1 && 'Help employers verify your identity and contact you'}
            {step === 2 && 'Share your work history and travel document status'}
            {step === 3 && 'Tell us where you want to work and when you can start'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Date of Birth" required>
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </FormField>
              <FormField label="Gender" required>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Email (optional)" className="sm:col-span-2">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </FormField>
              <FormField label="Full Address" required className="sm:col-span-2">
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no., street, landmark" />
              </FormField>
              <FormField label="Pincode" required>
                <Input inputMode="numeric" maxLength={6} value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} placeholder="6-digit pincode" />
              </FormField>
            </div>
          )}

          {step === 2 && (
            <>
              <FormField label="Secondary Skills (optional, max 5)">
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto rounded-md border p-3">
                  {skills.map((s) => (
                    <Badge
                      key={s.id}
                      variant={secondarySkillIds.includes(s.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(s.id)}
                    >
                      {s.name}
                    </Badge>
                  ))}
                </div>
              </FormField>
              <FormField label="Previous Employer (optional)">
                <Input value={previousEmployer} onChange={(e) => setPreviousEmployer(e.target.value)} placeholder="Last company or project" />
              </FormField>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Do you have a passport?</p>
                  <p className="text-sm text-muted-foreground">Required for overseas deployment</p>
                </div>
                <Switch checked={hasPassport} onCheckedChange={setHasPassport} />
              </div>
              {hasPassport && (
                <FormField label="Passport Number" required>
                  <Input value={passportNumber} onChange={(e) => setPassportNumber(e.target.value.toUpperCase())} placeholder="e.g. A1234567" />
                </FormField>
              )}
              <FormField label="ECR / ECNR Status" required>
                <Select value={ecrStatus} onValueChange={setEcrStatus}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {ECR_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </>
          )}

          {step === 3 && (
            <>
              <FormField label="Preferred Countries (max 5)" required>
                <div className="flex flex-wrap gap-2 rounded-md border p-3">
                  {PREFERRED_COUNTRIES.map((c) => (
                    <Badge
                      key={c}
                      variant={preferredCountries.includes(c) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleCountry(c)}
                    >
                      <Globe className="mr-1 h-3 w-3" />
                      {c}
                    </Badge>
                  ))}
                </div>
              </FormField>
              <FormField label="Availability" required>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger><SelectValue placeholder="When can you start?" /></SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <LabelBlock title="Open to Relocation" subtitle="Willing to relocate for overseas jobs" />
                <Switch checked={openToRelocation} onCheckedChange={setOpenToRelocation} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Expected Salary (optional)">
                  <Input type="number" value={expectedSalaryMin} onChange={(e) => setExpectedSalaryMin(e.target.value)} placeholder="e.g. 1500" />
                </FormField>
                <FormField label="Currency">
                  <Select value={expectedSalaryCurrency} onValueChange={setExpectedSalaryCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SALARY_CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <FormField label="Languages Spoken" required>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <label key={lang} className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer hover:bg-muted/50">
                      <Checkbox checked={languages.includes(lang)} onCheckedChange={() => toggleLanguage(lang)} />
                      {lang}
                    </label>
                  ))}
                </div>
              </FormField>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={handleBack} disabled={saving}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => navigate('/home')}>Skip for now</Button>
        )}

        <Button onClick={handleNext} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {step < 3 ? (
            <>Next <ChevronRight className="ml-1 h-4 w-4" /></>
          ) : (
            'Complete Profile'
          )}
        </Button>
      </div>
    </RegistrationLayout>
  );
}

function LabelBlock({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
