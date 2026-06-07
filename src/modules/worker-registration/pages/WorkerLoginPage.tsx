import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Lock, Mail, Phone } from 'lucide-react';
import RegistrationLayout from '../components/RegistrationLayout';
import FormField from '../components/FormField';
import GoogleAuthButton, { AuthDivider } from '../components/GoogleAuthButton';
import { useWorkerGoogleAuth } from '../hooks/useWorkerGoogleAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { workerLoginSchema, type WorkerLoginFormValues } from '../validation/registrationSchema';

export default function WorkerLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useWorkerAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useWorkerGoogleAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkerLoginFormValues>({
    resolver: zodResolver(workerLoginSchema),
    defaultValues: { loginMethod: 'mobile', mobileNumber: '', email: '', password: '' },
  });

  const loginMethod = watch('loginMethod');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: WorkerLoginFormValues) => {
    setError('');
    setSubmitting(true);
    const result = await login({
      password: values.password,
      ...(values.loginMethod === 'email'
        ? { email: values.email?.trim() }
        : { mobileNumber: values.mobileNumber }),
    });
    setSubmitting(false);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/home', { replace: true });
    } else {
      const message = result.error || 'Login failed. Check your credentials.';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <RegistrationLayout
      centered
      maxWidth="md"
      title="Worker Login"
      subtitle="Sign in with Google, email, or mobile number to access jobs and track your application."
      footer={
        <p className="pt-6 border-t border-border">
          New worker?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Register now
          </Link>
        </p>
      }
    >
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-cyan-500" />
        <CardContent className="p-6 md:p-8">
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <GoogleAuthButton label="Sign in with Google" returnPath="/login" />
          <AuthDivider />

          <Tabs
            value={loginMethod}
            onValueChange={(v) => setValue('loginMethod', v as 'mobile' | 'email')}
            className="mb-5"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="mobile" className="gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Mobile
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {loginMethod === 'mobile' ? (
              <FormField label="Mobile Number" error={errors.mobileNumber?.message} required>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="h-11 pl-10"
                    {...register('mobileNumber', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '');
                      },
                    })}
                  />
                </div>
              </FormField>
            ) : (
              <FormField label="Email Address" error={errors.email?.message} required>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 pl-10"
                    {...register('email')}
                  />
                </div>
              </FormField>
            )}

            <FormField label="Password" error={errors.password?.message} required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  className="h-11 pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <Button type="submit" className="w-full h-11 font-medium" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Worker Portal'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </RegistrationLayout>
  );
}
