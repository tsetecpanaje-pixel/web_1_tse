'use client';

import { LayoutDashboard, Filter, FileText, Settings, HelpCircle, ChevronRight } from 'lucide-react';

interface MenuNavigationProps {
    isOpen: boolean;
    onFilterClick?: () => void;
}

export default function MenuNavigation({ isOpen, onFilterClick }: MenuNavigationProps) {
    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', active: true },
        { icon: <Filter className="w-5 h-5" />, label: 'Filtros', onClick: onFilterClick },
        { icon: <FileText className="w-5 h-5" />, label: 'Ordenes (Pronto)', disabled: true },
        { icon: <Settings className="w-5 h-5" />, label: 'Configuración', disabled: true },
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Ayuda', disabled: true },
    ];

    return (
        <aside
            className={`fixed lg:static inset-y-0 left-0 w-64 border-r border-border bg-card/30 flex flex-col h-screen lg:h-[calc(100vh-4rem)] sticky top-0 lg:top-16 z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={item.onClick}
                        disabled={item.disabled}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${item.active
                                ? 'bg-primary/10 text-primary border border-primary/20 shadow-md'
                                : item.disabled
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {item.icon}
                            <span className="text-sm font-semibold">{item.label}</span>
                        </div>
                        {item.active && <ChevronRight className="w-4 h-4" />}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl">
                    <p className="text-xs font-bold text-secondary uppercase mb-1">Fase 2</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Generación de PDFs y OTs avanzadas en la próxima actualización.</p>
                </div>
            </div>
        </aside>
    );
}
