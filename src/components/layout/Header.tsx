'use client';

import { Train, Bell, User, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Header({ onAddClick }: { onAddClick: () => void }) {
    const [lastUpdate, setLastUpdate] = useState<string>('');

    useEffect(() => {
        setLastUpdate(format(new Date(), "dd-MM-yy, hh:mm b", { locale: es }));

        const interval = setInterval(() => {
            setLastUpdate(format(new Date(), "dd-MM-yy, hh:mm b", { locale: es }));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-16 sm:h-18 border-b border-border/60 bg-gradient-to-r from-background via-background to-background/80 backdrop-blur-lg sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-xl blur-md"></div>
                    <div className="relative bg-gradient-to-br from-primary to-primary/70 p-2.5 sm:p-3 rounded-xl shadow-lg">
                        <Train className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-md" />
                    </div>
                </div>
                <div className="block">
                    <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase leading-none bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Taller Línea 5
                    </h1>
                    <p className="text-[10px] sm:text-xs text-muted-foreground/80 font-medium mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Sistema de Gestión
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all rounded-lg relative group">
                    <Bell className="w-5 h-5 sm:w-5.5 sm:h-5.5 group-hover:scale-110 transition-transform" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card animate-pulse"></span>
                </button>
                <button className="p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all rounded-lg group">
                    <Settings className="w-5 h-5 sm:w-5.5 sm:h-5.5 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
                </button>
                <button className="p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all rounded-lg group">
                    <User className="w-5 h-5 sm:w-5.5 sm:h-5.5 group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </header>
    );
}
