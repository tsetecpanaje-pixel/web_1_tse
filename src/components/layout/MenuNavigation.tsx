'use client';

import { useState } from 'react';
import { LayoutDashboard, Filter, FileText, Settings, HelpCircle, ChevronRight, Plus } from 'lucide-react';

interface MenuNavigationProps {
    onDashboardClick?: () => void;
    onFilterClick?: () => void;
    onConfigClick?: () => void;
    activeView: 'dashboard' | 'filters' | 'config' | 'subir-datos';
}

export default function MenuNavigation({ onDashboardClick, onFilterClick, onConfigClick, activeView }: MenuNavigationProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', active: activeView === 'dashboard', onClick: () => { onDashboardClick?.(); setIsMenuOpen(false); } },
        { icon: <Filter className="w-5 h-5" />, label: 'Filtros', active: activeView === 'filters', onClick: () => { onFilterClick?.(); setIsMenuOpen(false); } },
        { icon: <FileText className="w-5 h-5" />, label: 'Ordenes', disabled: true },
        { icon: <Settings className="w-5 h-5" />, label: 'Configuración', active: activeView === 'config', onClick: () => { onConfigClick?.(); setIsMenuOpen(false); } },
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Ayuda', disabled: true },
    ];

    return (
        <>
            {/* Desktop Sidebar (unchanged) */}
            <aside
                className="hidden lg:flex fixed lg:static inset-y-0 left-0 w-64 border-r border-border bg-card/30 flex-col h-screen lg:h-[calc(100vh-4rem)] sticky top-16 z-50"
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
                                <span className="text-sm font-bold">{item.label}</span>
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

            {/* Mobile Floating Action Button Menu */}
            <div className="lg:hidden fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
                {/* Menu Options (Expand upwards) */}
                <div className={`flex flex-col items-end gap-3 mb-2 transition-all duration-300 origin-bottom pointer-events-auto ${isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-0 pointer-events-none'}`}>
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            disabled={item.disabled}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border transition-all active:scale-90 ${item.active
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card/90 backdrop-blur-xl text-foreground border-border'
                                } ${item.disabled ? 'opacity-50 grayscale' : ''}`}
                        >
                            <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
                            <div className="p-1">
                                {item.icon}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main FAB Trigger (Green) */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_8px_30_rgb(34,197,94,0.4)] transition-all duration-500 active:scale-90 pointer-events-auto ${isMenuOpen ? 'bg-destructive shadow-[0_8px_30px_rgb(239,68,68,0.4)] rotate-45' : 'bg-emerald-500 hover:bg-emerald-400'}`}
                >
                    {isMenuOpen ? (
                        <Plus className="w-8 h-8 text-white" />
                    ) : (
                        <LayoutDashboard className="w-7 h-7 text-white" />
                    )}
                </button>
            </div>

            {/* Backdrop for mobile menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </>
    );
}
