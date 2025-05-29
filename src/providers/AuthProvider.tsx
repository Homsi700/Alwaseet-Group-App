
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types'; // Make sure User type is comprehensive

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  // verifyToken is removed as primary verification is via middleware
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    // Clear the cookie by setting its expiration date to the past
    // Note: JavaScript cannot directly delete httpOnly cookies.
    // This relies on the server clearing it upon logout or an invalid token.
    // For client-side navigation, simply redirecting is often enough.
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    if (pathname !== '/login') {
        router.push('/login');
    }
  }, [router, pathname]);

  useEffect(() => {
    const initAuth = () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          // Basic client-side check: does the token exist? Is user data parsable?
          // More complex: decode JWT (not verify signature) to check expiry client-side.
          // For now, we'll assume if it's there, it's good for initial UI, middleware handles true verification.
          setUser(parsedUser);
          setToken(storedToken);
        } catch (e) {
          console.error("Failed to parse stored user data:", e);
          logout(); // Clear invalid stored data
        }
      } else {
        // If no token/user and not on login page, and not on other public pages
        const publicPaths = ['/login', '/register']; // Add other public paths if any
        if (!publicPaths.includes(pathname)) {
            // This might be too aggressive if middleware is already handling redirects.
            // router.push('/login'); 
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [pathname, logout]); // Add logout to dependency array

  const login = (newToken: string, userData: User) => {
    console.log('AuthProvider: Logging in user', userData);
    
    // تخزين البيانات في localStorage
    try {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('AuthProvider: User data stored in localStorage');
    } catch (error) {
      console.error('AuthProvider: Error storing data in localStorage', error);
    }
    
    // تحديث حالة المصادقة
    setUser(userData);
    setToken(newToken);
    console.log('AuthProvider: Authentication state updated');
    
    // لا نقوم بالتوجيه هنا، نترك ذلك لصفحة تسجيل الدخول
    // لتجنب التوجيه المزدوج
  };


  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {isLoading ? <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">جاري تحميل التطبيق...</div></div> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
