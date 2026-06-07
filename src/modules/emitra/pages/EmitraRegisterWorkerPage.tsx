import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, Upload, Camera, Video, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { emitraNavGroups, emitraProfileMenu } from '../config/emitraNav';
import {
  WORKER_SKILLS, EXPERIENCE_LEVELS, GCC_COUNTRIES, SKILL_LEVELS, MIGRATION_CATEGORY_LABELS,
} from '../config/constants';
import {
  workerPersonalSchema, workerJobInfoSchema, workerSkillScreeningSchema, workerMigrationSchema,
} from '../validations/emitra';
import { calculateMigrationScore, getMigrationCategory } from '../lib/migrationScore';
import {
  createPartnerWorker, getPartnerProfile, isPartnerOperational, uploadWorkerMedia,
} from '../services/emitraService';
import { indianStates } from '@/lib/validations/partner';

const STEPS = ['Personal', 'Job Info', 'Skill Screening', 'Migration', 'Photo & Video'] as const;

export default function EmitraRegisterWorkerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any>>({
    passport_available: false,
    ready_to_relocate: false,
    family_consent: false,
    previous_gcc_experience: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const p = await getPartnerProfile(user.id);
      if (!p || !(await isPartnerOperational(p))) {
        toast.error('Partner account must be approved to register workers');
        navigate('/emitra/dashboard');
        return;
      }
      setPartnerId(p.id);
    })();
  }, [user, navigate]);

  const update = (patch: Record<string, unknown>) => setData(d => ({ ...d, ...patch }));

  const migrationScore = calculateMigrationScore({
    passportAvailable: !!data.passport_available,
    readyToRelocate: !!data.ready_to_relocate,
    familyConsent: !!data.family_consent,
    previousGccExperience: !!data.previous_gcc_experience,
    expectedSalary: data.expected_salary,
  });
  const migrationCategory = getMigrationCategory(migrationScore);

  const STEP_SCHEMAS = [
    workerPersonalSchema,
    workerJobInfoSchema,
    workerSkillScreeningSchema,
    workerMigrationSchema,
    null,
  ] as const;

  const applySchemaErrors = (result: { success: false; error: { issues: { path: (string | number)[]; message: string }[] } }) => {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const k = issue.path[0] as string;
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    setErrors(fieldErrors);
    toast.error('Please fix highlighted fields');
  };

  const validateStep = (stepIndex: number): boolean => {
    const schema = STEP_SCHEMAS[stepIndex];
    if (!schema) {
      if (!photoFile) {
        toast.error('Worker photo is required');
        return false;
      }
      if (!videoFile) {
        toast.error('Worker video introduction is required');
        return false;
      }
      return true;
    }
    const result = schema.safeParse(data);
    if (!result.success) {
      applySchemaErrors(result);
      return false;
    }
    return true;
  };

  const validateCurrentStep = (): boolean => {
    setErrors({});
    return validateStep(step);
  };

  const validateAllSteps = (): boolean => {
    for (let i = 0; i < STEPS.length; i++) {
      setErrors({});
      if (!validateStep(i)) {
        setStep(i);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAllSteps() || !partnerId || !user) return;
    setSaving(true);
    try {
      let photoUrl: string | null = null;
      let videoUrl: string | null = null;

      if (photoFile) {
        const { path, error } = await uploadWorkerMedia(user.id, photoFile, 'photo');
        if (error) throw new Error(error);
        photoUrl = path;
      }
      if (videoFile) {
        const { path, error } = await uploadWorkerMedia(user.id, videoFile, 'video');
        if (error) throw new Error(error);
        videoUrl = path;
      }

      const { worker, error } = await createPartnerWorker(partnerId, {
        ...data,
        photo_url: photoUrl,
        video_url: videoUrl,
      });

      if (error || !worker) throw new Error(error || 'Registration failed');

      toast.success(`${data.full_name} registered successfully!`);
      navigate(`/emitra/workers/${worker.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <DashboardLayout navGroups={emitraNavGroups} portalLabel="E-Mitra Portal" portalName="SafeWork Global" profileMenuItems={emitraProfileMenu}>
      <h1 className="text-2xl font-bold mb-1">Register New Worker</h1>
      <p className="text-sm text-muted-foreground mb-4">Quick registration with skill screening and migration assessment</p>

      <Card className="p-4 mb-4">
        <Progress value={progress} className="h-2 mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((s, i) => (
            <span key={s} className={i === step ? 'text-primary font-medium' : ''}>{s}</span>
          ))}
        </div>
      </Card>

      <Card className="p-5 md:p-7">
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" error={errors.full_name} required>
              <Input value={data.full_name || ''} onChange={e => update({ full_name: e.target.value })} />
            </Field>
            <Field label="Mobile Number" error={errors.mobile} required>
              <Input inputMode="numeric" maxLength={10} value={data.mobile || ''}
                onChange={e => update({ mobile: e.target.value.replace(/\D/g, '') })} />
            </Field>
            <Field label="WhatsApp Number" error={errors.whatsapp} required>
              <Input inputMode="numeric" maxLength={10} value={data.whatsapp || ''}
                onChange={e => update({ whatsapp: e.target.value.replace(/\D/g, '') })} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Skill" error={errors.skill} required>
              <Select value={data.skill || ''} onValueChange={v => update({ skill: v })}>
                <SelectTrigger><SelectValue placeholder="Select skill" /></SelectTrigger>
                <SelectContent>{WORKER_SKILLS.filter(s => s !== 'Other').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Experience" error={errors.experience_level} required>
              <Select value={data.experience_level || ''} onValueChange={v => update({ experience_level: v })}>
                <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                <SelectContent>{EXPERIENCE_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Passport Available?" required>
              <RadioGroup value={data.passport_available ? 'yes' : 'no'} onValueChange={v => update({ passport_available: v === 'yes' })} className="flex gap-4">
                <label className="flex items-center gap-2"><RadioGroupItem value="yes" /> Yes</label>
                <label className="flex items-center gap-2"><RadioGroupItem value="no" /> No</label>
              </RadioGroup>
            </Field>
            <Field label="Preferred Country">
              <Select value={data.preferred_country || ''} onValueChange={v => update({ preferred_country: v })}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>{GCC_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="State" error={errors.state} required>
              <Select value={data.state || ''} onValueChange={v => update({ state: v })}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent className="max-h-72">{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="District" error={errors.district} required>
              <Input value={data.district || ''} onChange={e => update({ district: e.target.value })} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Field label="Skill Level" error={errors.skill_level} required>
              <Select value={data.skill_level || ''} onValueChange={v => update({ skill_level: v })}>
                <SelectTrigger><SelectValue placeholder="Assess skill level" /></SelectTrigger>
                <SelectContent>{SKILL_LEVELS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Operator Notes" error={errors.operator_notes} required>
              <Textarea rows={4} value={data.operator_notes || ''} onChange={e => update({ operator_notes: e.target.value })}
                placeholder="e.g. Good electrician, worked in construction site, previous GCC experience" />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {[
              { key: 'passport_available', label: 'Passport Available?' },
              { key: 'ready_to_relocate', label: 'Ready to Relocate?' },
              { key: 'family_consent', label: 'Family Consent?' },
              { key: 'previous_gcc_experience', label: 'Previous GCC Experience?' },
            ].map(q => (
              <Field key={q.key} label={q.label}>
                <RadioGroup value={data[q.key] ? 'yes' : 'no'} onValueChange={v => update({ [q.key]: v === 'yes' })} className="flex gap-4">
                  <label className="flex items-center gap-2"><RadioGroupItem value="yes" /> Yes</label>
                  <label className="flex items-center gap-2"><RadioGroupItem value="no" /> No</label>
                </RadioGroup>
              </Field>
            ))}
            <Field label="Expected Salary (₹/month)">
              <Input type="number" value={data.expected_salary ?? ''}
                onChange={e => update({ expected_salary: e.target.value === '' ? null : Number(e.target.value) })} />
            </Field>
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm font-medium">Migration Readiness Score</p>
              <p className="text-3xl font-bold text-primary mt-1">{migrationScore}/100</p>
              <p className="text-sm text-muted-foreground mt-1">{MIGRATION_CATEGORY_LABELS[migrationCategory]}</p>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">Worker Photo</p>
              <input ref={photoRef} type="file" accept="image/*" capture="user" className="hidden"
                onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
              <Button type="button" variant="outline" onClick={() => photoRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1" /> {photoFile ? 'Change Photo' : 'Capture Photo'}
              </Button>
              {photoFile && <p className="text-xs text-success mt-2 flex items-center justify-center gap-1"><CheckCircle2 className="h-3 w-3" /> {photoFile.name}</p>}
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Video Introduction</p>
              <p className="text-xs text-muted-foreground mb-2">Name, skill, experience</p>
              <input ref={videoRef} type="file" accept="video/*" capture="environment" className="hidden"
                onChange={e => setVideoFile(e.target.files?.[0] || null)} />
              <Button type="button" variant="outline" onClick={() => videoRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1" /> {videoFile ? 'Change Video' : 'Record Video'}
              </Button>
              {videoFile && <p className="text-xs text-success mt-2 flex items-center justify-center gap-1"><CheckCircle2 className="h-3 w-3" /> {videoFile.name}</p>}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-7 pt-5 border-t">
          <Button type="button" variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0 || saving}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => { if (validateCurrentStep()) setStep(s => s + 1); }} disabled={saving}>
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Register Worker
            </Button>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}

function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
