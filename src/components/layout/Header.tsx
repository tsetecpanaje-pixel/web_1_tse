'use client';

import { Train, Bell, User, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Header({ onAddClick }: { onAddClick: () => void }) {
    const [lastUpdate, setLastUpdate] = useState<string>('');

    useEffect(() => {
        setLastUpdate(format(new Date(), "dd-MM-yy, hh:mm b", { locale: es }));

        // In a real scenario, this would update when Supabase Realtime triggers
        const interval = setInterval(() => {
            setLastUpdate(format(new Date(), "dd-MM-yy, hh:mm b", { locale: es }));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                    <Train className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight">Taller de Trenes</h1>
                    <p className="text-xs text-muted-foreground">Última actualización: {lastUpdate}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onAddClick}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Agregar Nuevo Tren</span>
                </button>

                <div className="flex items-center gap-2 border-l border-border pl-4 ml-2">
                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full border-2 border-card"></span>
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
