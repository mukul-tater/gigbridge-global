import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  createPartnerWorker, deleteWorkerRegistrationDraft, getPartnerProfile,
  isPartnerOperational, loadWorkerRegistrationDraft, saveWorkerRegistrationDraft,
  uploadWorkerMedia,
} from '../services/emitraService';
import { indianStates } from '@/lib/validations/partner';

const STEPS = ['Personal', 'Job Info', 'Skill Screening', 'Migration', 'Photo & Video'] as const;

const DEFAULT_DATA: Record<string, unknown> = {
  skills: [],
  passport_available: false,
  ready_to_relocate: false,
  family_consent: false,
  previous_gcc_experience: false,
};

function draftKey(userId: string) {
  return `emitra_worker_reg_draft:${userId}`;
}

function loadDraft(userId: string): { data: Record<string, unknown>; step: number } | null {
  try {
    const raw = sessionStorage.getItem(draftKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      data: { ...DEFAULT_DATA, ...(parsed.data || {}) },
      step: typeof parsed.step === 'number' ? Math.min(parsed.step, STEPS.length - 1) : 0,
    };
  } catch {
    return null;
  }
}

function saveDraft(userId: string, data: Record<string, unknown>, step: number) {
  try {
    sessionStorage.setItem(draftKey(userId), JSON.stringify({ data, step }));
  } catch {
    /* storage full or unavailable */
  }
}

function clearDraft(userId: string) {
  try {
    sessionStorage.removeItem(draftKey(userId));
  } catch {
    /* ignore */
  }
}

export default function EmitraRegisterWorkerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any>>({ ...DEFAULT_DATA });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [savedPhotoPath, setSavedPhotoPath] = useState<string | null>(null);
  const [savedVideoPath, setSavedVideoPath] = useState<string | null>(null);
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

      const dbDraft = await loadWorkerRegistrationDraft(p.id, user.id);
      if (dbDraft) {
        setData({ ...DEFAULT_DATA, ...dbDraft.draft_data });
        setStep(dbDraft.current_step);
        setMaxStepReached(dbDraft.current_step);
        setSavedPhotoPath(dbDraft.photo_url);
        setSavedVideoPath(dbDraft.video_url);
      } else {
        const localDraft = loadDraft(user.id);
        if (localDraft) {
          setData(localDraft.data);
          setStep(localDraft.step);
          setMaxStepReached(localDraft.step);
        }
      }
      setLoading(false);
    })();
  }, [user, navigate]);

  const persistDraft = async (
    nextStep: number,
    media?: { photo_url?: string | null; video_url?: string | null },
  ) => {
    if (!partnerId || !user) return { error: 'Not ready' };
    const result = await saveWorkerRegistrationDraft(partnerId, user.id, nextStep, data, media);
    if (!result.error) saveDraft(user.id, data, nextStep);
    return result;
  };

  const update = (patch: Record<string, unknown>) => setData(d => ({ ...d, ...patch }));

  const toggleSkill = (skill: string) => {
    const current: string[] = Array.isArray(data.skills) ? data.skills : [];
    update({
      skills: current.includes(skill)
        ? current.filter(s => s !== skill)
        : [...current, skill],
    });
  };

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
      if (!photoFile && !savedPhotoPath) {
        toast.error('Worker photo is required');
        return false;
      }
      if (!videoFile && !savedVideoPath) {
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

  const goToStep = async (target: number) => {
    if (target < 0 || target >= STEPS.length) return;
    setErrors({});
    setStep(target);
    if (partnerId && user && target < step) {
      await persistDraft(target, { photo_url: savedPhotoPath, video_url: savedVideoPath });
    }
  };

  const handleContinue = async () => {
    if (!validateStep(step) || !partnerId || !user) return;
    const next = step + 1;
    setSaving(true);
    try {
      const { error } = await persistDraft(next, { photo_url: savedPhotoPath, video_url: savedVideoPath });
      if (error) throw new Error(error);
      setMaxStepReached(m => Math.max(m, next));
      setErrors({});
      setStep(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = async (file: File | null, type: 'photo' | 'video') => {
    if (!file || !user || !partnerId) return;
    setSaving(true);
    try {
      const { path, error } = await uploadWorkerMedia(user.id, file, type);
      if (error || !path) throw new Error(error || 'Upload failed');
      if (type === 'photo') {
        setPhotoFile(file);
        setSavedPhotoPath(path);
        await persistDraft(step, { photo_url: path, video_url: savedVideoPath });
      } else {
        setVideoFile(file);
        setSavedVideoPath(path);
        await persistDraft(step, { photo_url: savedPhotoPath, video_url: path });
      }
      toast.success(`${type === 'photo' ? 'Photo' : 'Video'} saved`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const validateAllSteps = (): boolean => {
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return false;
      }
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAllSteps() || !partnerId || !user) return;
    setSaving(true);
    try {
      let photoUrl = savedPhotoPath;
      let videoUrl = savedVideoPath;

      if (photoFile && !savedPhotoPath) {
        const { path, error } = await uploadWorkerMedia(user.id, photoFile, 'photo');
        if (error) throw new Error(error);
        photoUrl = path;
      }
      if (videoFile && !savedVideoPath) {
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

      await deleteWorkerRegistrationDraft(partnerId, user.id);
      clearDraft(user.id);
      toast.success(`${data.full_name} registered successfully!`);
      navigate(`/emitra/workers/${worker.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const selectedSkills: string[] = Array.isArray(data.skills) ? data.skills : [];

  if (loading) {
    return (
      <DashboardLayout navGroups={emitraNavGroups} portalLabel="E-Mitra Portal" portalName="SafeWork Global" profileMenuItems={emitraProfileMenu}>
        <div className="py-12 text-center text-muted-foreground">Loading registration…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navGroups={emitraNavGroups} portalLabel="E-Mitra Portal" portalName="SafeWork Global" profileMenuItems={emitraProfileMenu}>
      <h1 className="text-2xl font-bold mb-1">Register New Worker</h1>
      <p className="text-sm text-muted-foreground mb-4">Quick registration with skill screening and migration assessment</p>

      <Card className="p-4 mb-4">
        <Progress value={progress} className="h-2 mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              disabled={i > maxStepReached}
              onClick={() => goToStep(i)}
              className={`transition-colors ${i === step ? 'text-primary font-medium' : ''} ${i <= maxStepReached ? 'hover:text-primary cursor-pointer' : 'cursor-default opacity-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5 md:p-7">
        <div className={step === 0 ? '' : 'hidden'}>
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
        </div>

        <div className={step === 1 ? '' : 'hidden'}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label className="text-sm font-medium">Skills <span className="text-destructive">*</span></Label>
              <p className="text-xs text-muted-foreground mb-2">Select all skills that apply</p>
              <div className="grid sm:grid-cols-3 gap-2">
                {WORKER_SKILLS.map(skill => {
                  const checked = selectedSkills.includes(skill);
                  return (
                    <label
                      key={skill}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleSkill(skill)} />
                      {skill}
                    </label>
                  );
                })}
              </div>
              {errors.skills && <p className="text-xs text-destructive mt-1">{errors.skills}</p>}
            </div>
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
        </div>

        <div className={step === 2 ? '' : 'hidden'}>
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
        </div>

        <div className={step === 3 ? '' : 'hidden'}>
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
        </div>

        <div className={step === 4 ? '' : 'hidden'}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">Worker Photo</p>
              <input ref={photoRef} type="file" accept="image/*" capture="user" className="hidden"
                onChange={e => handleMediaUpload(e.target.files?.[0] || null, 'photo')} />
              <Button type="button" variant="outline" onClick={() => photoRef.current?.click()} disabled={saving}>
                <Upload className="h-4 w-4 mr-1" /> {(photoFile || savedPhotoPath) ? 'Change Photo' : 'Capture Photo'}
              </Button>
              {(photoFile || savedPhotoPath) && (
                <p className="text-xs text-success mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {photoFile?.name || 'Photo saved'}
                </p>
              )}
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Video Introduction</p>
              <p className="text-xs text-muted-foreground mb-2">Name, skill, experience</p>
              <input ref={videoRef} type="file" accept="video/*" capture="environment" className="hidden"
                onChange={e => handleMediaUpload(e.target.files?.[0] || null, 'video')} />
              <Button type="button" variant="outline" onClick={() => videoRef.current?.click()} disabled={saving}>
                <Upload className="h-4 w-4 mr-1" /> {(videoFile || savedVideoPath) ? 'Change Video' : 'Record Video'}
              </Button>
              {(videoFile || savedVideoPath) && (
                <p className="text-xs text-success mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {videoFile?.name || 'Video saved'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-7 pt-5 border-t">
          <Button type="button" variant="outline" onClick={() => void goToStep(step - 1)} disabled={step === 0 || saving}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => void handleContinue()} disabled={saving}>
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
