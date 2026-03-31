'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, Moon, Sun, Save, Loader2, ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfilePageProps {
    onClose: () => void;
}

export default function ProfilePage({ onClose }: ProfilePageProps) {
    const { user, session } = useAuth();
    const [nombre, setNombre] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (user?.user_metadata && !nombre) {
            const name = user.user_metadata.nombre || user.user_metadata.nombre_completo;
            if (name) {
                setNombre(name);
            } else if (user.email) {
                setNombre(user.email.split('@')[0]);
            }
        }
        setLoadingProfile(false);
    }, [user, nombre]);

    const [isDark, setIsDark] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const currentTheme = document.documentElement.classList.contains('dark');
        setIsDark(currentTheme);
    }, []);

    const setTheme = (dark: boolean) => {
        setIsDark(dark);
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('app-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('app-theme', 'light');
        }
    };

    const handleSaveNombre = async () => {
        const cleanNombre = nombre.trim();
        if (!cleanNombre || isSaving) return;

        if (!user?.id) {
            setMessage('Error: Sesión no encontrada');
            return;
        }

        setIsSaving(true);
        setMessage('');

        try {
            console.log('[PERFIL] Iniciando guardado para:', cleanNombre);

            // 1. Actualizar Auth Metadata (Lo más crítico y rápido)
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    nombre: cleanNombre,
                    nombre_completo: cleanNombre
                }
            });

            if (authError) {
                console.error('[PERFIL] Error Auth:', authError);
                throw authError;
            }

            // ÉXITO: Mostramos el mensaje de inmediato
            console.log('[PERFIL] Auth actualizada correctamente');
            setMessage('✓ Cambios guardados en tu cuenta');

            // 2. Proceso de fondo para la DB (no bloqueamos el mensaje de éxito)
            setTimeout(() => {
                supabase
                    .from('user_roles')
                    .update({ nombre: cleanNombre })
                    .eq('user_id', user.id)
                    .then(({ error: dbError }) => {
                        if (dbError) console.error('[PERFIL] Error asíncrono DB:', dbError);
                        else console.log('[PERFIL] DB sincronizada OK');
                    });
            }, 100);

            // Liberar interfaz
            setIsSaving(false);

            // Limpiar mensaje después de 6 segundos para que sea bien visible
            setTimeout(() => {
                setMessage('');
            }, 6000);

        } catch (error: any) {
            console.error('[PERFIL] Error crítico:', error);
            setMessage(`Error: ${error.message || 'Error al conectar con el servidor'}`);
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    Volver al Dashboard
                </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

                <div className="flex items-center gap-2 mb-6 relative z-10">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Perfil de Usuario</h2>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Correo electrónico</label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm opacity-60 cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium">Nombre completo</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="flex-1 bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                                placeholder="Ingrese su nombre"
                            />
                            <button
                                onClick={handleSaveNombre}
                                disabled={isSaving}
                                className="btn-primary px-4 py-2 flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Guardar
                            </button>
                        </div>
                        {message && (
                            <div className={`mt-6 p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${message.toLowerCase().includes('error')
                                    ? 'bg-red-500/20 border-red-500/30 text-red-200'
                                    : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                }`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${message.toLowerCase().includes('error') ? 'bg-red-500/30' : 'bg-emerald-500/30'
                                    }`}>
                                    {message.toLowerCase().includes('error') ? (
                                        <AlertCircle className="w-6 h-6 text-red-400" />
                                    ) : (
                                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black uppercase tracking-wider mb-0.5">
                                        {message.toLowerCase().includes('error') ? 'Error de Sistema' : 'Sincronización Exitosa'}
                                    </p>
                                    <p className="text-xs font-medium opacity-90">{message.replace('✓ ', '')}</p>
                                </div>
                                <button
                                    onClick={() => setMessage('')}
                                    className="text-xs font-bold hover:underline opacity-50 px-2"
                                >
                                    Cerrar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-primary">
                    {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <h2 className="text-lg font-bold">Apariencia</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Modo Claro */}
                    <button
                        onClick={() => setTheme(false)}
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all p-4 text-left ${!isDark ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30 bg-muted/10'}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${!isDark ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <Sun className="w-5 h-5" />
                            </div>
                            {!isDark && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        </div>
                        <p className="font-bold text-sm">Modo Claro</p>
                        <p className="text-xs text-muted-foreground mt-1">Limpio y brillante</p>

                        <div className="mt-4 flex gap-2">
                            <div className="w-full h-8 rounded bg-background border border-border overflow-hidden">
                                <div className="h-2 w-1/3 bg-muted m-1 rounded" />
                                <div className="h-1 w-2/3 bg-muted m-1 rounded opacity-50" />
                            </div>
                        </div>
                    </button>

                    {/* Modo Oscuro */}
                    <button
                        onClick={() => setTheme(true)}
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all p-4 text-left ${isDark ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-muted-foreground/30 bg-muted/10'}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <Moon className="w-5 h-5" />
                            </div>
                            {isDark && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        </div>
                        <p className="font-bold text-sm">Modo Oscuro</p>
                        <p className="text-xs text-muted-foreground mt-1">Elegante y técnico</p>

                        <div className="mt-4 flex gap-2">
                            <div className="w-full h-8 rounded bg-slate-900 border border-slate-800 overflow-hidden">
                                <div className="h-2 w-1/3 bg-slate-800 m-1 rounded" />
                                <div className="h-1 w-2/3 bg-slate-800 m-1 rounded opacity-50" />
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}