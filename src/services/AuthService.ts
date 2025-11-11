import { mockDataService } from './MockDataService';
import type { User, UserRole } from '@/types/mock-data';

const SESSION_KEY = 'gigworker_demo_session';

export interface AuthSession {
  user: User;
  token: string; // mock token
  expiresAt: number;
}

class AuthService {
  private session: AuthSession | null = null;

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored) as AuthSession;
        // Check if expired
        if (session.expiresAt > Date.now()) {
          this.session = session;
        } else {
          this.clearSession();
        }
      } catch (error) {
        console.error('Failed to parse session', error);
        this.clearSession();
      }
    }
  }

  private saveSession(session: AuthSession): void {
    this.session = session;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  private clearSession(): void {
    this.session = null;
    localStorage.removeItem(SESSION_KEY);
  }

  // Mock login
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    await mockDataService.initialize();
    
    const user = mockDataService.getUserByEmail(email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Simple password check (in demo mode, we just compare plaintext)
    if (user.passwordHash !== password) {
      return { success: false, error: 'Invalid password' };
    }

    // Create session
    const session: AuthSession = {
      user,
      token: `mock_token_${user.id}_${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };

    this.saveSession(session);
    return { success: true, user };
  }

  // Mock signup
  async signup(data: {
    email: string;
    password: string;
    name: string;
    mobile: string;
    role: UserRole;
  }): Promise<{ success: boolean; error?: string; user?: User }> {
    await mockDataService.initialize();
    
    // Check if user already exists
    const existing = mockDataService.getUserByEmail(data.email);
    if (existing) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      role: data.role,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      passwordHash: data.password, // In demo, store plaintext
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`
    };

    mockDataService.createUser(newUser);

    // Auto-login after signup
    const session: AuthSession = {
      user: newUser,
      token: `mock_token_${newUser.id}_${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };

    this.saveSession(session);
    return { success: true, user: newUser };
  }

  // Mock OTP verification (always accepts "000000")
  async verifyOTP(otp: string): Promise<{ success: boolean; error?: string }> {
    if (otp === '000000') {
      return { success: true };
    }
    return { success: false, error: 'Invalid OTP. Demo OTP is 000000' };
  }

  logout(): void {
    this.clearSession();
  }

  getSession(): AuthSession | null {
    return this.session;
  }

  getCurrentUser(): User | null {
    return this.session?.user ?? null;
  }

  isAuthenticated(): boolean {
    return this.session !== null && this.session.expiresAt > Date.now();
  }

  hasRole(role: UserRole): boolean {
    return this.session?.user.role === role;
  }
}

export const authService = new AuthService();
