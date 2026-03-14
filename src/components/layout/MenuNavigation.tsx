'use client';

import { useState } from 'react';
import { LayoutDashboard, Filter, FileText, Settings, HelpCircle, Plus, Sparkles } from 'lucide-react';

interface MenuNavigationProps {
    onDashboardClick?: () => void;
    onFilterClick?: () => void;
    onConfigClick?: () => void;
    activeView: 'dashboard' | 'filters' | 'config' | 'subir-datos' | 'profile';
    canAccessConfig?: boolean;
}

export default function MenuNavigation({ onDashboardClick, onFilterClick, onConfigClick, activeView, canAccessConfig = false }: MenuNavigationProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', active: activeView === 'dashboard', onClick: () => { onDashboardClick?.(); setIsMenuOpen(false); } },
        ...(canAccessConfig ? [{ icon: <Settings className="w-5 h-5" />, label: 'Configuración', active: activeView === 'config', onClick: () => { onConfigClick?.(); setIsMenuOpen(false); } }] : []),
        { icon: <Filter className="w-5 h-5" />, label: 'Filtros', active: activeView === 'filters', onClick: () => { onFilterClick?.(); setIsMenuOpen(false); } },
        { icon: <FileText className="w-5 h-5" />, label: 'Ordenes', disabled: true },
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Ayuda', disabled: true },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden lg:flex fixed lg:static inset-y-0 left-0 w-64 border-r border-border/40 bg-card/10 backdrop-blur-md flex-col h-screen lg:h-[calc(100vh-4rem)] sticky top-16 z-50 transition-all duration-300"
            >
                <nav className="flex-1 p-4 space-y-4">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            disabled={item.disabled}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group ${item.active
                                ? 'bg-gradient-to-r from-primary/20 via-primary/5 to-transparent text-primary border border-primary/20 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.2)]'
                                : item.disabled
                                    ? 'opacity-30 cursor-not-allowed'
                                    : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground hover:scale-[1.02]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl transition-all duration-300 ${item.active
                                    ? 'bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg shadow-primary/20'
                                    : 'bg-muted/30 group-hover:bg-muted group-hover:rotate-3'}`}>
                                    {item.icon}
                                </div>
                                <span className="text-sm font-black tracking-tight uppercase">{item.label}</span>
                            </div>
                            {item.active && (
                                <div className="flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-gradient-to-br from-amber-500/20 via-orange-600/5 to-transparent border border-amber-500/10 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500 cursor-default">
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-500" />
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Próximamente</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-bold">
                            Fase 2: Generación de reportes PDF y gestión de OTs avanzadas.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Mobile Floating Action Button Menu */}
            <div className="lg:hidden fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
                {/* Menu Options (Expand upwards) */}
                <div className={`flex flex-col items-end gap-3 mb-2 transition-all duration-500 origin-bottom pointer-events-auto ${isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-0 pointer-events-none'}`}>
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            disabled={item.disabled}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border transition-all active:scale-95 ${item.active
                                ? 'bg-gradient-to-r from-primary to-emerald-600 text-white border-emerald-500/50'
                                : 'bg-card/95 backdrop-blur-2xl text-foreground border-border/60'
                                } ${item.disabled ? 'opacity-40 grayscale blur-[1px]' : ''}`}
                        >
                            <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                            <div className={`p-1.5 rounded-lg ${item.active ? 'bg-white/20' : 'bg-muted/50'}`}>
                                {item.icon}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main FAB Trigger */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 pointer-events-auto ${isMenuOpen
                        ? 'bg-orange-500 rotate-45 shadow-orange-500/40 translate-y-[-4px]'
                        : 'bg-gradient-to-br from-emerald-500 to-primary shadow-emerald-500/40 hover:scale-110 hover:-translate-y-1'
                        }`}
                >
                    {isMenuOpen ? (
                        <Plus className="w-8 h-8 text-white" />
                    ) : (
                        <LayoutDashboard className="w-8 h-8 text-white" />
                    )}
                </button>
            </div>

            {/* Backdrop for mobile menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-md z-[90] lg:hidden animate-in fade-in duration-500"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </>
    );
}
