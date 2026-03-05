'use client';

import { Train, Bell, User } from 'lucide-react';
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
        <header className="h-14 sm:h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-primary/20 p-1.5 sm:p-2 rounded-lg">
                    <Train className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="hidden xsm:block">
                    <h1 className="text-sm sm:text-lg font-black tracking-tighter uppercase sm:capitalize leading-none">Taller Trenes</h1>
                    <p className="text-[9px] sm:text-xs text-muted-foreground font-medium">{lastUpdate}</p>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-all relative group">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-secondary rounded-full border border-card"></span>
                </button>
                <button className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-all group">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110" />
                </button>
            </div>
        </header>
    );
}
