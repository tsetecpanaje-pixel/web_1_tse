'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';
import { Users, Shield, ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export default function AdminPage() {
  const { user, isCreador, loading: authLoading, role } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');

  useEffect(() => {
    console.log('AdminPage - authLoading:', authLoading, 'isCreador:', isCreador, 'role:', role);
    setDebug(`authLoading: ${authLoading}, isCreador: ${isCreador}, role: ${role}, user: ${user?.email}`);
    
    if (!authLoading && isCreador) {
      fetchUsers();
    }
  }, [authLoading, isCreador, role, user]);

  const fetchUsers = async () => {
    setLoading(true);
    console.log('Fetching users from user_roles...');
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('user_roles data:', data, 'error:', error);

    if (!data || data.length === 0) {
      console.log('No users found in user_roles table');
      setUsers([]);
      setLoading(false);
      return;
    }

    setUsers(data.map(ur => ({
      id: ur.user_id,
      email: 'Cargando...',
      role: ur.role as UserRole,
      created_at: ur.created_at,
    })));
    
    const usersWithEmail = await Promise.all(
      data.map(async (ur) => {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(ur.user_id);
          return {
            id: ur.user_id,
            email: userData.user?.email || `User ${ur.user_id.slice(0, 8)}`,
            role: ur.role as UserRole,
            created_at: ur.created_at,
          };
        } catch {
          return {
            id: ur.user_id,
            email: `User ${ur.user_id.slice(0, 8)}`,
            role: ur.role as UserRole,
            created_at: ur.created_at,
          };
        }
      })
    );
    setUsers(usersWithEmail);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    setUpdating(userId);
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setUpdating(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCreador) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Shield className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
        <Link href="/" className="btn-primary mt-4">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'creador': return 'bg-purple-500';
      case 'admin': return 'bg-red-500';
      case 'usuario': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/" 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground text-sm">Administra los roles de los usuarios</p>
          </div>
        </div>

        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm">
          <p><strong>Debug:</strong> {debug}</p>
          <p><strong>Users:</strong> {users.length}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-bold text-sm">Usuario</th>
                  <th className="text-left p-4 font-bold text-sm">Rol</th>
                  <th className="text-right p-4 font-bold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${getRoleColor(u.role)}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {u.role !== 'creador' && (
                          <>
                            <button
                              onClick={() => updateRole(u.id, 'usuario')}
                              disabled={updating === u.id || u.role === 'usuario'}
                              className="px-3 py-1.5 text-xs font-medium bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-lg disabled:opacity-50 transition-colors"
                              title="Cambiar a Usuario"
                            >
                              Usuario
                            </button>
                            <button
                              onClick={() => updateRole(u.id, 'admin')}
                              disabled={updating === u.id || u.role === 'admin'}
                              className="px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg disabled:opacity-50 transition-colors"
                              title="Cambiar a Administrador"
                            >
                              Admin
                            </button>
                            <button
                              onClick={() => updateRole(u.id, 'publico')}
                              disabled={updating === u.id || u.role === 'publico'}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-500/20 text-slate-500 hover:bg-slate-500/30 rounded-lg disabled:opacity-50 transition-colors"
                              title="Cambiar a Público"
                            >
                              Público
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
