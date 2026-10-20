/**
 * Admin Store - Separate authentication and session management for admin users
 * This store is completely isolated from the author-facing AppStore
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Role } from '../types';
import { RateLimiter, sanitizeEmail, generateSecureToken, hashPassword } from '../utils/security';

// Admin credentials (in production, these would be in environment variables)
const ADMIN_CREDENTIALS = {
  email: 'admin@tlcjournal.org',
  // Pre-hashed password for "admin123" - in production use bcrypt
  passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6494ba915250'
};

// Rate limiter for admin login
const adminLoginLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Admin session storage key (separate from author session)
const ADMIN_SESSION_KEY = 'tlcj-admin-session-v1';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  loginTime: string;
  sessionToken: string;
}

interface AdminStoreState {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  loginAttempts: number;
  lockoutUntil: number | null;
}

interface AdminStoreActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: () => boolean;
  getSessionToken: () => string | null;
}

type AdminStore = AdminStoreState & AdminStoreActions;

const AdminStoreContext = createContext<AdminStore | null>(null);

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // Load admin session from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored) as AdminUser;
        // Validate session (check if token is still valid, etc.)
        if (session && session.sessionToken && session.role === 'admin') {
          setAdminUser(session);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const sanitizedEmail = sanitizeEmail(email);
    
    // Check rate limiting
    if (adminLoginLimiter.isLimited(sanitizedEmail)) {
      const remaining = adminLoginLimiter.getRemainingAttempts(sanitizedEmail);
      return {
        success: false,
        error: `Too many login attempts. Please try again in 15 minutes. (${remaining} attempts remaining)`
      };
    }

    // Check lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
      return {
        success: false,
        error: `Account locked. Please try again in ${minutesLeft} minute(s).`
      };
    }

    // Record attempt
    adminLoginLimiter.recordAttempt(sanitizedEmail);

    // Validate credentials
    if (sanitizedEmail !== ADMIN_CREDENTIALS.email) {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      
      // Lock account after 5 failed attempts
      if (attempts >= 5) {
        const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minutes
        setLockoutUntil(lockoutTime);
        return {
          success: false,
          error: 'Account locked due to too many failed attempts. Please try again in 15 minutes.'
        };
      }
      
      return {
        success: false,
        error: `Invalid credentials. ${5 - attempts} attempt(s) remaining.`
      };
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    if (passwordHash !== ADMIN_CREDENTIALS.passwordHash) {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      
      if (attempts >= 5) {
        const lockoutTime = Date.now() + 15 * 60 * 1000;
        setLockoutUntil(lockoutTime);
        return {
          success: false,
          error: 'Account locked due to too many failed attempts. Please try again in 15 minutes.'
        };
      }
      
      return {
        success: false,
        error: `Invalid credentials. ${5 - attempts} attempt(s) remaining.`
      };
    }

    // Successful login
    const sessionToken = generateSecureToken(64);
    const admin: AdminUser = {
      id: 'admin-001',
      email: sanitizedEmail,
      role: 'admin',
      loginTime: new Date().toISOString(),
      sessionToken
    };

    // Store session
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
    setAdminUser(admin);
    setLoginAttempts(0);
    setLockoutUntil(null);
    adminLoginLimiter.clearAttempts(sanitizedEmail);

    return { success: true };
  }, [loginAttempts, lockoutUntil]);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminUser(null);
    setLoginAttempts(0);
    setLockoutUntil(null);
  }, []);

  const isAdmin = useCallback(() => {
    return adminUser !== null && adminUser.role === 'admin';
  }, [adminUser]);

  const getSessionToken = useCallback(() => {
    return adminUser?.sessionToken || null;
  }, [adminUser]);

  const value: AdminStore = {
    adminUser,
    isAuthenticated: adminUser !== null,
    loginAttempts,
    lockoutUntil,
    login,
    logout,
    isAdmin,
    getSessionToken
  };

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore(): AdminStore {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error('useAdminStore must be used within AdminStoreProvider');
  }
  return context;
}
