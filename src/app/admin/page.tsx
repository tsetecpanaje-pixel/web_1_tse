'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';
import { Users, Shield, ArrowLeft, Check, X, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface UserWithRole {
  id: string;
  email: string;
  nombre?: string;
  role: UserRole;
  created_at: string;
}

export default function AdminPage() {
  const { user, isCreador, loading: authLoading, role } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: 'nombre' | 'role'; direction: 'asc' | 'desc' }>({ key: 'role', direction: 'asc' });
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

    if (error) {
      console.error('Error fetching users (FULL):', JSON.stringify(error, null, 2));
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No se encontraron registros en user_roles.');
      setUsers([]);
      setLoading(false);
      return;
    }

    const formattedUsers = data.map(ur => ({
      id: ur.user_id,
      email: ur.email || `User ${ur.user_id.slice(0, 8)}`,
      nombre: ur.nombre || 'Sin nombre',
      role: ur.role as UserRole,
      created_at: ur.created_at,
    }));

    setUsers(formattedUsers);
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

  const handleSort = (key: 'nombre' | 'role') => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    let valA = (key === 'nombre' ? (a.nombre || a.email) : a.role).toLowerCase();
    let valB = (key === 'nombre' ? (b.nombre || b.email) : b.role).toLowerCase();

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ column }: { column: 'nombre' | 'role' }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
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
          <div className="bg-card border border-border rounded-2xl">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th
                    className="text-left p-4 font-bold text-sm cursor-pointer hover:bg-muted transition-colors group select-none sticky top-0 bg-muted z-30"
                    onClick={() => handleSort('nombre')}
                  >
                    <div className="flex items-center gap-1.5">
                      Usuario
                      <div className="flex items-center min-w-[16px]">
                        {sortConfig.key === 'nombre' ? (
                          <SortIcon column="nombre" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-all" />
                        )}
                      </div>
                    </div>
                  </th>
                  <th
                    className="text-left p-4 font-bold text-sm cursor-pointer hover:bg-muted transition-colors group select-none sticky top-0 bg-muted z-30"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-1.5">
                      Rol
                      <div className="flex items-center min-w-[16px]">
                        {sortConfig.key === 'role' ? (
                          <SortIcon column="role" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-all" />
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="text-right p-4 font-bold text-sm sticky top-0 bg-muted z-30">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {u.nombre ? u.nombre[0].toUpperCase() : <Users className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{u.nombre || 'Sin nombre'}</span>
                          <span className="text-xs text-muted-foreground">{u.email}</span>
                        </div>
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
