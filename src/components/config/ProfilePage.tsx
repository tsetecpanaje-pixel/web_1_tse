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

    const handleThemeToggle = () => {
        setIsDark(!isDark);
        if (isDark) {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
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
                <div className="flex items-center gap-2 mb-6">
                    {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                    <h2 className="text-lg font-bold">Apariencia</h2>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-primary/20' : 'bg-yellow-500/20'}`}>
                            {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium">Modo {isDark ? 'Oscuro' : 'Claro'}</p>
                            <p className="text-xs text-muted-foreground">{isDark ? 'Tema oscuro activo' : 'Tema claro activo'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleThemeToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}