import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import EmitraLayout from '../components/EmitraLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Mail, Store } from 'lucide-react';
import { toast } from 'sonner';
import { isPartnerOperational, getPartnerProfile } from '../services/emitraService';

type Method = 'mobile' | 'email';
type Step = 'credentials' | 'otp';

export default function EmitraLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();
  const [method, setMethod] = useState<Method>('mobile');
  const [step, setStep] = useState<Step>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (isAuthenticated && role === 'partner') {
      navigate('/emitra/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const checkPartnerApproved = async (userId: string): Promise<boolean> => {
    const profile = await getPartnerProfile(userId);
    return isPartnerOperational(profile);
  };

  const partnerLogin = async (authEmail: string, mobileDigits: string) => {
    const password = `SWP-${mobileDigits}`;
    let result = await login(authEmail, password);
    if (!result.success && authEmail !== `emitra${mobileDigits}@partners.safeworkglobal.app`) {
      result = await login(`emitra${mobileDigits}@partners.safeworkglobal.app`, password);
    }
    return result;
  };

  const handleMobileOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const digits = mobile.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    const { data: prof } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('phone', digits)
      .maybeSingle();

    if (!prof) {
      setError('No partner account found with this mobile. Please apply first.');
      return;
    }

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', prof.id)
      .maybeSingle();

    if (roleRow?.role !== 'partner') {
      setError('This mobile is not registered as an E-Mitra partner.');
      return;
    }

    const approved = await checkPartnerApproved(prof.id!);
    if (!approved) {
      setError('Your partner application is pending approval. You will be notified once approved.');
      return;
    }

    toast.success(`OTP sent to ${digits}`, { description: 'Demo: enter any 6 digits' });
    setStep('otp');
  };

  const handleMobileOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    const digits = mobile.replace(/\D/g, '');
    const { data: prof } = await supabase
      .from('profiles')
      .select('email')
      .eq('phone', digits)
      .maybeSingle();

    if (!prof?.email) {
      setError('Account lookup failed');
      setLoading(false);
      return;
    }

    const result = await partnerLogin(prof.email, digits);
    if (!result.success) {
      setError('Login failed. Use email + password or contact support.');
      setLoading(false);
      return;
    }

    toast.success('Welcome back!');
    navigate('/emitra/dashboard', { replace: true });
    setLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email.trim(), password);
    if (!result.success) {
      setError(result.error || 'Login failed');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Authentication failed');
      setLoading(false);
      return;
    }

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleRow?.role !== 'partner') {
      await supabase.auth.signOut();
      setError('This account is not an E-Mitra partner account.');
      setLoading(false);
      return;
    }

    const approved = await checkPartnerApproved(user.id);
    if (!approved) {
      await supabase.auth.signOut();
      setError('Your partner application is pending approval.');
      setLoading(false);
      return;
    }

    toast.success('Welcome back!');
    navigate('/emitra/dashboard', { replace: true });
    setLoading(false);
  };

  return (
    <EmitraLayout title="E-Mitra Partner Login" subtitle="Sign in to manage worker registrations">
      <Card className="max-w-md border-border/60 shadow-lg">
        <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Partner Sign In</h2>
            <p className="text-xs text-muted-foreground">Approved partners only</p>
          </div>
        </div>

        <Tabs value={method} onValueChange={v => { setMethod(v as Method); setStep('credentials'); setError(''); }}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="mobile" className="gap-1.5"><Phone className="h-3.5 w-3.5" /> Mobile OTP</TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {method === 'mobile' ? (
          step === 'credentials' ? (
            <form onSubmit={handleMobileOtpRequest} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Mobile Number</Label>
                <Input
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile"
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <Button type="submit" className="w-full h-11">Send OTP</Button>
            </form>
          ) : (
            <form onSubmit={handleMobileOtpVerify} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Enter OTP sent to <strong>{mobile}</strong>
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading || otp.length !== 6}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify & Sign In
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('credentials')}>
                Change number
              </Button>
            </form>
          )
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="partner@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sign In
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          New partner?{' '}
          <Link to="/emitra/register" className="text-primary font-medium hover:underline">
            Apply as SafeWork Partner
          </Link>
        </p>
        </div>
      </Card>
    </EmitraLayout>
  );
}
