import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type AppRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, Briefcase, HardHat, Users, ShieldCheck, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AuthView = 'login' | 'signup' | 'forgot' | 'role-select';

const roles: { value: AppRole; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { value: 'worker', label: 'Worker', description: 'Find international job opportunities', icon: <HardHat className="h-6 w-6" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400' },
  { value: 'employer', label: 'Employer', description: 'Hire skilled workers globally', icon: <Briefcase className="h-6 w-6" />, color: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400' },
  { value: 'agent', label: 'Agent', description: 'Recruit & place workers for employers', icon: <Users className="h-6 w-6" />, color: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400' },
  { value: 'admin', label: 'Admin', description: 'Platform administration & oversight', icon: <ShieldCheck className="h-6 w-6" />, color: 'bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-400' },
];

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, isEmailVerified } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<AppRole | null>(null);

  // Forgot
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      if (!isEmailVerified) {
        navigate('/verify-email');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isEmailVerified, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    if (!result.success) setError(result.error || 'Login failed');
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signupRole) { setError('Please select a role'); return; }
    if (!signupName.trim()) { setError('Full name is required'); return; }
    if (signupPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);

    const result = await signup({
      email: signupEmail,
      password: signupPassword,
      full_name: signupName,
      phone: signupPhone,
      role: signupRole
    });

    if (result.success) {
      navigate('/verify-email');
      toast.success('Account created! Check your email to verify.');
    } else {
      setError(result.error || 'Signup failed');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) { setError(error.message); }
      else {
        toast.success('Reset link sent! Check your inbox.');
        setResetEmail('');
        setView('login');
      }
    } catch { setError('Failed to send reset email'); }
    setLoading(false);
  };

  const handleRoleSelect = (role: AppRole) => {
    setSignupRole(role);
    setView('signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-mesh)' }} />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <img src="/safework-global-logo.png" alt="SafeWorkGlobal" className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {view === 'login' && 'Welcome back'}
            {view === 'role-select' && 'Join as'}
            {view === 'signup' && 'Create your account'}
            {view === 'forgot' && 'Reset password'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {view === 'login' && 'Sign in to your SafeWorkGlobal account'}
            {view === 'role-select' && 'Choose how you want to use the platform'}
            {view === 'signup' && `Signing up as ${roles.find(r => r.value === signupRole)?.label}`}
            {view === 'forgot' && "We'll send you a link to reset it"}
          </p>
        </div>

        <Card className="shadow-lg border-border/60">
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* LOGIN */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button type="button" onClick={() => { setError(''); setView('forgot'); }} className="text-xs text-primary hover:underline">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required minLength={6} className="h-11 pr-10" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
                <p className="text-sm text-center text-muted-foreground pt-2">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setError(''); setView('role-select'); }} className="text-primary font-medium hover:underline">Sign up</button>
                </p>
              </form>
            )}

            {/* ROLE SELECT */}
            {view === 'role-select' && (
              <div className="space-y-3">
                {roles.map(r => (
                  <button
                    key={r.value}
                    onClick={() => handleRoleSelect(r.value)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group',
                      r.color
                    )}
                  >
                    <div className="shrink-0">{r.icon}</div>
                    <div>
                      <div className="font-semibold text-foreground">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.description}</div>
                    </div>
                  </button>
                ))}
                <p className="text-sm text-center text-muted-foreground pt-2">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setError(''); setView('login'); }} className="text-primary font-medium hover:underline">Sign in</button>
                </p>
              </div>
            )}

            {/* SIGNUP FORM */}
            {view === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <button type="button" onClick={() => { setError(''); setView('role-select'); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors -mt-1 mb-2">
                  <ArrowLeft className="h-3.5 w-3.5" /> Change role
                </button>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" placeholder="Your full name" value={signupName} onChange={e => setSignupName(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input id="signup-phone" type="tel" placeholder="+1 234 567 8900" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required minLength={6} className="h-11 pr-10" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <p className="text-sm text-center text-muted-foreground pt-1">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setError(''); setView('login'); }} className="text-primary font-medium hover:underline">Sign in</button>
                </p>
              </form>
            )}

            {/* FORGOT PASSWORD */}
            {view === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <button type="button" onClick={() => { setError(''); setView('login'); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors -mt-1 mb-2">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                </button>
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input id="reset-email" type="email" placeholder="you@example.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
