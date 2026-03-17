'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';

const CREATOR_EMAIL = 'dgatica.electronico@gmail.com';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nombre: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<{ error: Error | null }>;
  isCreador: boolean;
  isAdmin: boolean;
  isUsuario: boolean;
  canEdit: boolean;
  canAccessConfig: boolean;
  canAccessAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const isCreador = role === 'creador';
  const isAdmin = role === 'creador' || role === 'admin';
  const isUsuario = role === 'creador' || role === 'admin' || role === 'usuario';
  const canEdit = isUsuario;
  const canAccessConfig = isAdmin;
  const canAccessAdmin = isCreador;

  const fetchUserRole = async (userId: string, userEmail: string | undefined): Promise<UserRole> => {
    console.log('fetchUserRole - email:', userEmail, 'CREATOR_EMAIL:', CREATOR_EMAIL);

    if (userEmail && userEmail.toLowerCase() === CREATOR_EMAIL.toLowerCase()) {
      console.log('User is CREATOR!');
      return 'creador';
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return 'publico';
    }

    return data.role as UserRole;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('Refresh Token Not Found')) {
          supabase.auth.signOut().then(() => {
            window.location.reload(); // Refresh to ensure a clean state
          });
        }
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id, session.user.email).then((userRole) => {
          setRole(userRole);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Session error:', err);
      if (err.message?.includes('Invalid Refresh Token') || err.message?.includes('Refresh Token Not Found')) {
        supabase.auth.signOut().then(() => {
          window.location.reload();
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (_event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
        console.log('Auth event:', _event);
      }

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const userRole = await fetchUserRole(session.user.id, session.user.email);
        setRole(userRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (err: any) {
      if (err.message?.includes('Invalid Refresh Token')) {
        await supabase.auth.signOut();
      }
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, nombre: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre
        }
      }
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    return { error: error as Error | null };
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!isCreador) {
      return { error: new Error('No tienes permisos para modificar roles') as Error | null };
    }

    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateUserRole,
      isCreador,
      isAdmin,
      isUsuario,
      canEdit,
      canAccessConfig,
      canAccessAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
