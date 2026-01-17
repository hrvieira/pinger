'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
     name: string;
     email: string;
     role: string;
}

interface AuthContextType {
     user: User | null;
     token: string | null;
     isAuthenticated: boolean;
     isLoading: boolean;
     login: (token: string, user: User) => void;
     logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: {children: ReactNode}) {
     const [user, setUser] = useState<User | null>(null);
     const [token, setToken] = useState<string | null>(null);
     const [isLoading, setIsLoading] = useState<boolean>(true);
     const router = useRouter();

     useEffect(() => {
          const storedToken = localStorage.getItem('pinger_token');
          const storedUser = localStorage.getItem('pinger_user');

          if (storedToken && storedUser) {
               setToken(storedToken);
               setUser(JSON.parse(storedUser));
          }

          setIsLoading(false);
     }, []);

     const login = (newToken: string, newUser: User) => {
          localStorage.setItem('pinger_token', newToken);
          localStorage.setItem('pinger_user', JSON.stringify(newUser));
          setToken(newToken);
          setUser(newUser);
          router.push('/');
     };

     const logout = () => {
          localStorage.removeItem('pinger_token');
          localStorage.removeItem('pinger_user');
          setToken(null);
          setUser(null);
          router.push('/login');
     };

     return (
          <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout}}>
               {children}
          </AuthContext.Provider>
     );
}

export const useAuth = () => {
     const context = useContext(AuthContext);
     if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
     return context;
};