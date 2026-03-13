'use client';

import { useState, Fragment } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, Clock, MapPin, Wrench } from 'lucide-react';
import { RegistroTren } from '@/types/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getModeloTren } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface TrainRecordsTableProps {
    registros: RegistroTren[];
    onEdit: (registro: RegistroTren) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
}

export default function TrainRecordsTable({ registros, onEdit, onDelete, isLoading }: TrainRecordsTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { canEdit } = useAuth();

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getStatusClass = (tipo: string) => {
        switch (tipo) {
            case 'Avería':
                return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
            case 'Mantenimiento Preventivo':
                return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
            case 'O. Especial':
                return 'bg-blue-600/10 text-blue-400 border border-blue-600/30';
            case 'Evacuación':
                return 'bg-red-500/10 text-red-500 border border-red-500/30';
            case 'Lavado':
                return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30';
            case 'Estacionado':
                return 'bg-amber-900/20 text-amber-600 border border-amber-900/30';
            case 'Otro':
                return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center dashboard-card">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-card overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-full">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-3 sm:px-6 py-4 text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest">Tren</th>
                            <th className="px-3 sm:px-6 py-4 text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest">Ingreso</th>
                            <th className="px-3 sm:px-6 py-4 text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest">Atención</th>
                            <th className="px-3 sm:px-6 py-4 text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest">Lugar</th>
                            <th className="hidden md:table-cell px-3 sm:px-6 py-4 text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest">Motivo</th>
                            <th className="px-3 sm:px-6 py-4 text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Info</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {registros.map((reg) => (
                            <Fragment key={reg.id}>
                                <tr
                                    onClick={() => toggleExpand(reg.id)}
                                    className="hover:bg-muted/10 cursor-pointer transition-colors group relative"
                                >
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                                            <div className={`flex items-center justify-center rounded-lg font-black transition-all w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-base ${!reg.fecha_hora_salida
                                                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                }`}>
                                                {reg.tren}
                                            </div>
                                            <span className="text-[8px] sm:text-[9px] font-black opacity-40 uppercase tracking-tighter">
                                                {getModeloTren(reg.tren)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <p className="text-[10px] sm:text-sm font-bold text-foreground leading-tight">
                                            {format(new Date(reg.fecha_hora_entrada), "dd MMM", { locale: es })}
                                        </p>
                                        <p className="text-[9px] sm:text-xs text-muted-foreground font-medium">
                                            {format(new Date(reg.fecha_hora_entrada), "HH:mm", { locale: es })}
                                        </p>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border ${getStatusClass(reg.tipo_atencion)}`}>
                                            {reg.tipo_atencion === 'Mantenimiento Preventivo' ? 'Mant. Prev.' : reg.tipo_atencion}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <span className="text-[10px] sm:text-sm font-black whitespace-nowrap bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">{reg.lugar_destino}</span>
                                    </td>
                                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground max-w-[150px] truncate" title={reg.motivo_trabajo}>
                                        {reg.motivo_trabajo}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                        <div className={`p-1 rounded-full transition-colors ${expandedId === reg.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground opacity-50'}`}>
                                            {expandedId === reg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </td>
                                </tr>

                                {expandedId === reg.id && (
                                    <tr className="bg-muted/10">
                                        <td colSpan={6} className="px-6 py-6 border-t border-border/50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                <div>
                                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                                                        <Clock className="w-3 h-3" /> Detalles del Trabajo
                                                    </h4>
                                                    <p className="text-sm font-medium mb-1">Motivo:</p>
                                                    <p className="text-sm text-muted-foreground mb-4">{reg.motivo_trabajo}</p>

                                                    {reg.mini_filtros && (
                                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                                            {(typeof reg.mini_filtros === 'string'
                                                                ? (reg.mini_filtros as string).split(', ')
                                                                : (reg.mini_filtros as any[])
                                                            ).map(f => (
                                                                <span key={f} className="px-1.5 py-0.5 bg-secondary/10 text-secondary-foreground text-[10px] font-bold rounded border border-secondary/20 uppercase">
                                                                    {f}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {reg.observacion ? (
                                                        <>
                                                            <p className="text-sm font-medium mb-1">Observación:</p>
                                                            <p className="text-sm text-muted-foreground">{reg.observacion}</p>
                                                        </>
                                                    ) : (
                                                        <p className="text-xs italic text-muted-foreground">Sin observaciones.</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                                                        <Wrench className="w-3 h-3" /> Solución y Técnicos
                                                    </h4>
                                                    {reg.solucion ? (
                                                        <>
                                                            <p className="text-sm font-medium mb-1">Solución:</p>
                                                            <p className="text-sm text-muted-foreground mb-4">{reg.solucion}</p>
                                                        </>
                                                    ) : (
                                                        <p className="text-xs italic text-muted-foreground mb-4">Sin solución registrada aún.</p>
                                                    )}

                                                    <p className="text-sm font-medium mb-2">Técnicos:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(reg.tecnicos_involucrados || []).map(t => (
                                                            <span key={t} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded border border-primary/20">
                                                                {t}
                                                            </span>
                                                        ))}
                                                        {(!reg.tecnicos_involucrados || reg.tecnicos_involucrados.length === 0) && <span className="text-xs italic text-muted-foreground">Ninguno asignado</span>}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                                                            <MapPin className="w-3 h-3" /> Estado
                                                        </h4>
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <span className={`w-3 h-3 rounded-full ${reg.disponible ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></span>
                                                            <span className="text-sm font-medium">{reg.disponible ? 'Disponible' : 'En Trabajo'}</span>
                                                        </div>

                                                        <p className="text-xs text-muted-foreground">Salida:</p>
                                                        <p className="text-sm">
                                                            {reg.fecha_hora_salida
                                                                ? format(new Date(reg.fecha_hora_salida), "dd/MM/yyyy, HH:mm", { locale: es })
                                                                : 'Pendiente'}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3 mt-6">
                                                        {canEdit && (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onEdit(reg); }}
                                                                className="btn-secondary py-1.5 px-3 transition-all duration-200 hover:scale-[1.05] active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/15"
                                                            >
                                                                <Edit2 className="w-4 h-4" /> Editar
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onDelete(reg.id); }}
                                                                className="flex items-center gap-1.5 text-destructive hover:text-white hover:bg-destructive px-2 py-1 rounded-md transition-all duration-200 border border-destructive/20 text-[11px] font-semibold hover:scale-[1.05] active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-destructive/15"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                                            </button>
                                                        </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                        {registros.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                    No hay registros encontrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
