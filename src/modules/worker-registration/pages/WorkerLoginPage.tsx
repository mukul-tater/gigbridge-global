import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import RegistrationLayout from '../components/RegistrationLayout';
import FormField from '../components/FormField';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { workerLoginSchema, type WorkerLoginFormValues } from '../validation/registrationSchema';

export default function WorkerLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useWorkerAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerLoginFormValues>({
    resolver: zodResolver(workerLoginSchema),
    defaultValues: { mobileNumber: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: WorkerLoginFormValues) => {
    setSubmitting(true);
    const result = await login(values.mobileNumber, values.password);
    setSubmitting(false);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/home', { replace: true });
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <RegistrationLayout
      title="Worker Login"
      subtitle="Sign in with your registered mobile number"
      footer={
        <>
          New worker?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register now
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card className="border-0 shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your worker dashboard and job opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <FormField label="Password" error={errors.password?.message} required>
              <Input type="password" placeholder="Your password" {...register('password')} />
            </FormField>
            <Button type="submit" className="w-full h-11" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </RegistrationLayout>
  );
}
