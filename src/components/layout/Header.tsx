'use client';

import { Train, Bell, User, Settings, LogOut, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Header({ onAddClick, onProfileClick, onConfigClick }: { onAddClick?: () => void; onProfileClick?: () => void; onConfigClick?: () => void }) {
    const { user, signOut, role, isCreador, canAccessAdmin, isAdmin, canAccessConfig } = useAuth();
    const [lastUpdate, setLastUpdate] = useState<string>('');

    const getRoleLabel = (r: string | null) => {
        switch (r) {
            case 'creador': return { label: 'CREADOR', color: 'bg-amber-500 shadow-amber-500/20' };
            case 'admin': return { label: 'ADMIN', color: 'bg-orange-500 shadow-orange-500/20' };
            case 'usuario': return { label: 'USUARIO', color: 'bg-emerald-500 shadow-emerald-500/20' };
            default: return { label: 'PÚBLICO', color: 'bg-slate-600' };
        }
    };

    const roleInfo = getRoleLabel(role);

    useEffect(() => {
        setLastUpdate(format(new Date(), "dd-MM-yy, hh:mm b", { locale: es }));

        const interval = setInterval(() => {
            setLastUpdate(format(new Date(), "dd-MM-yy, hh:mm b", { locale: es }));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-16 sm:h-18 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between shadow-sm transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative group/logo">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover/logo:bg-primary/30 transition-colors duration-500"></div>
                    <img src="/SGT_01.png" alt="SGT_01" className="relative w-10 h-10 sm:w-12 sm:h-12 object-contain dark:brightness-125 contrast-[1.05] drop-shadow-xl select-none transition-all duration-500 group-hover/logo:scale-110" />
                </div>
                <div className="block">
                    <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase leading-none bg-gradient-to-br from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                        Taller Línea 5
                    </h1>
                    <p className="hidden sm:flex text-[10px] sm:text-xs text-muted-foreground/60 font-black uppercase tracking-widest mt-1 items-center gap-2">
                        <span className="flex w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                        Sistema Gestión de Trenes
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-lg text-sm text-muted-foreground border border-border/40">
                    <span className="max-w-[120px] truncate font-medium">{user?.user_metadata?.nombre_completo || user?.user_metadata?.nombre || user?.email}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded shadow-sm ${roleInfo.color}`}>
                        {roleInfo.label}
                    </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 ml-1 sm:ml-2">
                    <button
                        onClick={onProfileClick}
                        className="p-2 sm:p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg group relative"
                        title="Perfil de Usuario"
                    >
                        <User className="w-5 h-5 sm:w-5.5 sm:h-5.5 group-hover:scale-110 transition-transform" />
                    </button>

                    <button className="p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all rounded-lg relative group">
                        <Bell className="w-5 h-5 sm:w-5.5 sm:h-5.5 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card animate-pulse"></span>
                    </button>

                    {canAccessConfig && (
                        <button
                            onClick={onConfigClick}
                            className="p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all rounded-lg group"
                            title="Configuración de Sistema"
                        >
                            <Settings className="w-5 h-5 sm:w-5.5 sm:h-5.5 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
                        </button>
                    )}

                    {isCreador && (
                        <Link
                            href="/admin"
                            className="p-2 sm:p-2.5 text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10 transition-all rounded-lg group"
                            title="Panel de Administración"
                        >
                            <Shield className="w-5 h-5 sm:w-5.5 sm:h-5.5 group-hover:scale-110 transition-transform" />
                        </Link>
                    )}

                    <div className="w-px h-6 bg-border/60 mx-1 hidden sm:block" />

                    <button
                        onClick={() => signOut()}
                        className="p-2 sm:p-2.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all rounded-lg group"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5 sm:w-5.5 sm:h-5.5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </header>
    );
}
