import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Clock, Shield } from 'lucide-react';
import RegistrationLayout from '../components/RegistrationLayout';
import FormField from '../components/FormField';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { workerApi } from '../services/workerApi';
import {
  workerRegisterSchema,
  type WorkerRegisterFormValues,
} from '../validation/registrationSchema';
import type { District, Skill, State } from '../types/worker.types';
import { EXPERIENCE_OPTIONS } from '../types/worker.types';

export default function WorkerRegisterPage() {
  const navigate = useNavigate();
  const { register: registerWorker, isAuthenticated } = useWorkerAuth();
  const [submitting, setSubmitting] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingRef, setLoadingRef] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkerRegisterFormValues>({
    resolver: zodResolver(workerRegisterSchema),
    defaultValues: {
      mobileNumber: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      aadhaarNumber: '',
      stateId: undefined,
      districtId: undefined,
      primarySkillId: undefined,
      experienceLevel: undefined,
    },
  });

  const selectedStateId = watch('stateId');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    workerApi
      .getReferenceData()
      .then((data) => {
        setStates(data.states);
        setSkills(data.skills);
      })
      .catch(() => toast.error('Failed to load form options'))
      .finally(() => setLoadingRef(false));
  }, []);

  useEffect(() => {
    if (!selectedStateId) {
      setDistricts([]);
      setValue('districtId', undefined as unknown as number);
      return;
    }

    workerApi
      .getDistricts(selectedStateId)
      .then(setDistricts)
      .catch(() => toast.error('Failed to load districts'));
  }, [selectedStateId, setValue]);

  const onSubmit = async (values: WorkerRegisterFormValues) => {
    setSubmitting(true);
    const result = await registerWorker(values as Parameters<typeof registerWorker>[0]);
    setSubmitting(false);

    if (result.success) {
      toast.success('Registration successful! Welcome aboard.');
      navigate('/home', { replace: true });
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  if (loadingRef) {
    return (
      <RegistrationLayout title="Worker Registration" subtitle="Loading registration form...">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RegistrationLayout>
    );
  }

  return (
    <RegistrationLayout
      title="Register as a Worker"
      subtitle="Complete in under 1 minute. Start matching with overseas jobs today."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {[
          { icon: Clock, text: 'Under 1 minute' },
          { icon: Shield, text: 'Secure & verified' },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 rounded-lg border bg-background/80 px-3 py-2 text-sm text-muted-foreground backdrop-blur"
          >
            <Icon className="h-4 w-4 text-primary" />
            {text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card className="border-0 shadow-xl shadow-primary/5">
          <CardHeader className="pb-4">
            <CardTitle>Quick Registration</CardTitle>
            <CardDescription>All fields marked with * are required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
                Account
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Mobile Number" error={errors.mobileNumber?.message} required>
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    {...register('mobileNumber', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '');
                      },
                    })}
                  />
                </FormField>
                <div className="hidden sm:block" />
                <FormField label="Password" error={errors.password?.message} required>
                  <Input type="password" placeholder="Min. 6 characters" {...register('password')} />
                </FormField>
                <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
                  <Input type="password" placeholder="Re-enter password" {...register('confirmPassword')} />
                </FormField>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
                Personal Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name" error={errors.fullName?.message} required className="sm:col-span-2">
                  <Input placeholder="As per Aadhaar" {...register('fullName')} />
                </FormField>
                <FormField label="Aadhaar Number" error={errors.aadhaarNumber?.message} required className="sm:col-span-2">
                  <Input
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                    {...register('aadhaarNumber', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '');
                      },
                    })}
                  />
                </FormField>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
                Location
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="State" error={errors.stateId?.message} required>
                  <Select
                    value={selectedStateId ? String(selectedStateId) : ''}
                    onValueChange={(v) => {
                      setValue('stateId', Number(v), { shouldValidate: true });
                      setValue('districtId', undefined as unknown as number);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {states.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="District / City" error={errors.districtId?.message} required>
                  <Select
                    value={watch('districtId') ? String(watch('districtId')) : ''}
                    onValueChange={(v) => setValue('districtId', Number(v), { shouldValidate: true })}
                    disabled={!selectedStateId || districts.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedStateId ? 'Select district' : 'Select state first'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {districts.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
                Skills & Experience
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Primary Skill" error={errors.primarySkillId?.message} required>
                  <Select
                    value={watch('primarySkillId') ? String(watch('primarySkillId')) : ''}
                    onValueChange={(v) => setValue('primarySkillId', Number(v), { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {skills.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Experience" error={errors.experienceLevel?.message} required>
                  <Select
                    value={watch('experienceLevel') || ''}
                    onValueChange={(v) =>
                      setValue('experienceLevel', v as WorkerRegisterFormValues['experienceLevel'], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </section>

            <Button type="submit" className="w-full h-12 text-base" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </RegistrationLayout>
  );
}
