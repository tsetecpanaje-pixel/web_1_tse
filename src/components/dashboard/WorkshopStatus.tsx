'use client';

import React from 'react';
import { Train } from 'lucide-react';
import { RegistroTren, LugarDestino } from '@/types/database';

interface WorkshopStatusProps {
    registros: RegistroTren[];
    onViewSummary: (registro: RegistroTren) => void;
    onAdd: (lugar: LugarDestino) => void;
    canEdit?: boolean;
}

const LOCATIONS: { id: LugarDestino; label: string }[][] = [
    [
        { id: 'Foso 1', label: 'F1' },
        { id: 'Foso 2', label: 'F2' },
        { id: 'Foso 3', label: 'F3' },
        { id: 'Foso 4', label: 'F4' },
        { id: 'Foso 5', label: 'F5' },
        { id: 'Foso 6', label: 'F6' },
    ],
    [
        { id: 'Nave Lavado', label: 'NL' },
        { id: 'Vía Prueba', label: 'VE' },
        { id: 'Cochera G14-1', label: 'G14-1' },
        { id: 'Cochera G14-2', label: 'G14-2' },
        { id: 'FV VV', label: 'VV' },
        { id: 'FV PM', label: 'PM' },
    ],
    [
        { id: 'Cochera_1', label: 'C1' },
        { id: 'Cochera_2', label: 'C2' },
        { id: 'Cochera_3', label: 'C3' },
        { id: 'Cochera_4', label: 'C4' },
    ]
];

export default function WorkshopStatus({ registros, onViewSummary, onAdd, canEdit = true }: WorkshopStatusProps) {
    // A location is occupied if there's a record with that destination and NO exit date
    const getOccupant = (locationId: LugarDestino) => {
        return registros.find(r => r.lugar_destino === locationId && !r.fecha_hora_salida);
    };

    const getAttentionTheme = (tipo: string, disponible: boolean) => {
        if (disponible) return {
            border: 'border-emerald-500/40',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-500',
            hover: 'hover:bg-emerald-500/20',
            shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.1)]'
        };

        switch (tipo) {
            case 'Avería': return {
                border: 'border-orange-500/40',
                bg: 'bg-orange-500/10',
                text: 'text-orange-500',
                hover: 'hover:bg-orange-500/20',
                shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.1)]'
            };
            case 'Mantenimiento Preventivo': return {
                border: 'border-emerald-500/40',
                bg: 'bg-emerald-500/10',
                text: 'text-emerald-500',
                hover: 'hover:bg-emerald-500/20',
                shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.1)]'
            };
            case 'O. Especial': return {
                border: 'border-blue-500/40',
                bg: 'bg-blue-500/10',
                text: 'text-blue-500',
                hover: 'hover:bg-blue-500/20',
                shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.1)]'
            };
            case 'Evacuación': return {
                border: 'border-red-500/40',
                bg: 'bg-red-500/10',
                text: 'text-red-500',
                hover: 'hover:bg-red-500/20',
                shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.1)]'
            };
            case 'Lavado': return {
                border: 'border-yellow-500/40',
                bg: 'bg-yellow-500/10',
                text: 'text-yellow-500',
                hover: 'hover:bg-yellow-500/20',
                shadow: 'shadow-[0_0_10px_rgba(234,179,8,0.1)]'
            };
            case 'Estacionado': return {
                border: 'border-amber-600/40',
                bg: 'bg-amber-600/10',
                text: 'text-amber-600',
                hover: 'hover:bg-amber-600/20',
                shadow: 'shadow-[0_0_10px_rgba(217,119,6,0.1)]'
            };
            case 'Cambio de Posición': return {
                border: 'border-purple-400/40',
                bg: 'bg-purple-400/10',
                text: 'text-purple-400',
                hover: 'hover:bg-purple-400/20',
                shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.1)]'
            };
            case 'Otro': return {
                border: 'border-slate-400/40',
                bg: 'bg-slate-400/10',
                text: 'text-slate-400',
                hover: 'hover:bg-slate-400/20',
                shadow: 'shadow-[0_0_10px_rgba(148,163,184,0.1)]'
            };
            default: return {
                border: 'border-muted/40',
                bg: 'bg-muted/10',
                text: 'text-muted-foreground',
                hover: 'hover:bg-muted/20',
                shadow: ''
            };
        }
    };

    return (
        <div className="dashboard-card p-4 sm:p-6 h-full flex flex-col relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

            <h3 className="text-[11px] sm:text-sm font-black mb-4 sm:mb-6 text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Estado Taller San Eugenio
            </h3>

            <div className="space-y-4 sm:space-y-8 flex-1 flex flex-col justify-start relative z-20 pb-32 lg:pb-0">
                {LOCATIONS.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-6 gap-1 sm:gap-4">
                        {row.map((loc) => {
                            const occupant = getOccupant(loc.id);
                            const theme = occupant ? getAttentionTheme(occupant.tipo_atencion, occupant.disponible) : null;

                            return (
                                <div key={loc.id} className="flex flex-col items-center gap-1">
                                    <span className={`text-[11px] sm:text-[13px] font-black uppercase tracking-tighter transition-colors duration-300 ${theme ? theme.text : 'text-muted-foreground opacity-50'}`}>
                                        {loc.label}
                                    </span>
                                    <div
                                        onClick={() => {
                                            if (occupant) {
                                                onViewSummary(occupant);
                                            } else if (canEdit) {
                                                onAdd(loc.id);
                                            }
                                        }}
                                        className={`w-full aspect-square max-w-[58px] sm:max-w-[70px] rounded-lg sm:rounded-xl border-[1.5px] sm:border-2 flex flex-col items-center justify-center transition-all duration-300 ${canEdit ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'} ${occupant && theme
                                            ? `${theme.bg} ${theme.border} ${theme.shadow} ${theme.hover}`
                                            : 'bg-muted/5 border-border/40 border-dashed hover:bg-muted/20 hover:border-primary/40'
                                            }`}>
                                        {occupant && theme ? (
                                            <>
                                                <Train className={`w-6 h-6 sm:w-5 sm:h-5 mb-0.5 animate-in fade-in zoom-in duration-500 ${theme.text}`} />
                                                <span className={`text-[16px] sm:text-xs font-black tracking-tighter leading-none ${theme.text}`}>{occupant.tren}</span>
                                            </>
                                        ) : (
                                            <div className="w-1 h-1 rounded-full bg-border/40" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="mt-6 sm:mt-8 space-y-4 pt-3 border-t border-border/20 text-center sm:text-right">
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2 text-[10px] sm:text-[11px] font-black uppercase tracking-tighter text-muted-foreground/70">
                    <div className="flex items-center gap-1.5 transition-opacity hover:opacity-100 opacity-80">
                        <div className="w-2 h-2 rounded-full bg-orange-500/40 border border-orange-500/60" />
                        En Trabajo
                    </div>
                    <div className="flex items-center gap-1.5 transition-opacity hover:opacity-100 opacity-80">
                        <div className="w-2 h-2 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
                        Disponible
                    </div>
                    <div className="flex items-center gap-1.5 transition-opacity hover:opacity-100 opacity-80">
                        <div className="w-2 h-2 rounded-full bg-muted/20 border border-border/40 border-dashed" />
                        Libre
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    {['Avería', 'Mantenimiento Preventivo', 'O. Especial', 'Evacuación', 'Lavado', 'Estacionado', 'Cambio de Posición', 'Otro'].map((tipo) => {
                        const theme = getAttentionTheme(tipo, false);
                        return (
                            <div key={tipo} className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${theme.text.replace('text-', 'bg-')} border ${theme.border}`} />
                                <span>{tipo === 'Mantenimiento Preventivo' ? 'Mant. Prev.' : tipo}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
