'use client';

import React from 'react';
import { Train } from 'lucide-react';
import { RegistroTren, LugarDestino } from '@/types/database';

interface WorkshopStatusProps {
    registros: RegistroTren[];
    onEdit: (registro: RegistroTren) => void;
    onAdd: (lugar: LugarDestino) => void;
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
    ]
];

export default function WorkshopStatus({ registros, onEdit, onAdd }: WorkshopStatusProps) {
    // A location is occupied if there's a record with that destination and NO exit date
    const getOccupant = (locationId: LugarDestino) => {
        return registros.find(r => r.lugar_destino === locationId && !r.fecha_hora_salida);
    };

    const getAttentionColor = (tipo: string) => {
        switch (tipo) {
            case 'Avería': return 'text-orange-500';
            case 'Mantenimiento Preventivo': return 'text-emerald-500';
            case 'O. Especial': return 'text-blue-500';
            case 'Evacuación': return 'text-red-500';
            case 'Lavado': return 'text-yellow-500';
            case 'Estacionado': return 'text-amber-700';
            case 'Otro': return 'text-slate-400';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className="dashboard-card p-6 h-full flex flex-col">
            <h3 className="text-sm font-bold mb-6 text-muted-foreground uppercase tracking-widest">
                Estado Taller San Eugenio
            </h3>

            <div className="space-y-8 flex-1 flex flex-col justify-center">
                {LOCATIONS.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-6 gap-4">
                        {row.map((loc) => {
                            const occupant = getOccupant(loc.id);
                            return (
                                <div key={loc.id} className="flex flex-col items-center gap-2">
                                    <span className={`text-[13px] font-bold transition-colors duration-300 ${occupant ? getAttentionColor(occupant.tipo_atencion) : 'text-muted-foreground'}`}>
                                        {loc.label}
                                    </span>
                                    <div
                                        onClick={() => occupant ? onEdit(occupant) : onAdd(loc.id)}
                                        className={`w-full aspect-square max-w-[80px] rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${occupant
                                            ? (occupant.disponible
                                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20'
                                                : 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:bg-orange-500/20')
                                            : 'bg-muted/10 border-border border-dashed hover:bg-muted/30 hover:border-primary/50'
                                            }`}>
                                        {occupant ? (
                                            <>
                                                <Train className={`w-6 h-6 mb-1 animate-in fade-in zoom-in duration-500 ${occupant.disponible ? 'text-emerald-500' : 'text-orange-500'
                                                    }`} />
                                                <span className={`text-sm font-bold ${occupant.disponible ? 'text-emerald-500' : 'text-orange-500'
                                                    }`}>{occupant.tren}</span>
                                            </>
                                        ) : (
                                            <div className="w-1 h-1 rounded-full bg-border" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="mt-8 space-y-3">
                <div className="flex items-center justify-end gap-3 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded bg-orange-500/20 border border-orange-500/50" />
                        En Trabajo
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded bg-emerald-500/20 border border-emerald-500/50" />
                        Disponible
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded bg-muted/30 border border-border border-dashed" />
                        Libre
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 border-t border-border/30 pt-3">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Avería
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Mant. Prev.
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        O. Especial
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Evacuación
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        Lavado
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-700" />
                        Estacionado
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Otro
                    </div>
                </div>
            </div>
        </div>
    );
}
