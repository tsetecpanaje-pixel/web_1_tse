'use client';

import React from 'react';
import { X, Edit2, Train, Clock, MapPin, Wrench, ShieldCheck, Tag, MessageSquare, ArrowRightLeft } from 'lucide-react';
import { RegistroTren } from '@/types/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getModeloTren } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface TrainSummaryModalProps {
    registro: RegistroTren;
    onClose: () => void;
    onEdit: (registro: RegistroTren) => void;
    onMove: (registro: RegistroTren) => void;
}

export default function TrainSummaryModal({ registro, onClose, onEdit, onMove }: TrainSummaryModalProps) {
    const { canEdit } = useAuth();
    const getAttentionColor = (tipo: string) => {
        switch (tipo) {
            case 'Avería': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'Mantenimiento Preventivo': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'O. Especial': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Evacuación': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'Lavado': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'Estacionado': return 'text-amber-600 bg-amber-600/10 border-amber-600/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${getAttentionColor(registro.tipo_atencion)}`}>
                            <Train className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight">Tren {registro.tren}</h2>
                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded border border-primary/20 uppercase">
                                    {getModeloTren(registro.tren)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{registro.lugar_destino}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/20 p-3 rounded-xl border border-border/50">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1 tracking-widest">Ingreso</span>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                {format(new Date(registro.fecha_hora_entrada), "dd MMM, HH:mm", { locale: es })}
                            </div>
                        </div>
                        <div className="bg-muted/20 p-3 rounded-xl border border-border/50">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1 tracking-widest">Estado</span>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className={`w-2 h-2 rounded-full ${registro.disponible ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`} />
                                {registro.disponible ? 'Disponible' : 'En Trabajo'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Tag className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold mb-1">Motivo del Trabajo</h4>
                                <p className="text-sm text-muted-foreground">{registro.motivo_trabajo}</p>
                            </div>
                        </div>

                        {registro.observacion && (
                            <div className="flex items-start gap-4">
                                <MessageSquare className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold mb-1">Observaciones</h4>
                                    <p className="text-sm text-muted-foreground">{registro.observacion}</p>
                                </div>
                            </div>
                        )}

                        {(registro.solucion || (registro.repuestos && registro.repuestos.length > 0)) && (
                            <div className="flex items-start gap-4">
                                <ShieldCheck className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold mb-1 tracking-tight">Solución / Gestión</h4>
                                    {registro.solucion && (
                                        <p className="text-sm text-muted-foreground leading-relaxed break-words">{registro.solucion}</p>
                                    )}
                                    
                                    {registro.repuestos && registro.repuestos.length > 0 && (
                                        <div className={`mt-2 pt-2 ${registro.solucion ? 'border-t border-border/40' : ''}`}>
                                            <span className="text-[9px] uppercase font-bold text-primary/60 block mb-1.5 tracking-widest">Repuestos intervenidos</span>
                                            <div className="space-y-1">
                                                {registro.repuestos.map((rp, i) => (
                                                    <div key={i} className="text-[11px] leading-tight text-slate-400 font-medium">
                                                        <span className="text-primary font-bold">{rp.prefijo}</span>
                                                        <span className="text-foreground ml-1">{rp.nombre}</span>
                                                        {rp.manual && <span className="text-muted-foreground ml-1 italic font-medium">({rp.manual})</span>}
                                                        
                                                        {/* Mostrar Coche si existe */}
                                                        {rp.coche && <span className="ml-1 text-primary font-bold">[{rp.coche}]</span>}
 
                                                        {/* Lógica de Cruce (CR/, CC/, CT/ y CRT/) */}
                                                        {(rp.prefijo === 'CR/' || rp.prefijo === 'CC/' || rp.prefijo === 'CT/' || rp.prefijo === 'CRT/') && (
                                                            <>
                                                                {(rp.prefijo === 'CR/' || rp.prefijo === 'CC/') && (
                                                                    <span className="mx-1 text-primary italic font-black">x</span>
                                                                )}
                                                                {(rp.prefijo === 'CT/' || rp.prefijo === 'CRT/') && (
                                                                    <span className="ml-2 text-primary font-black uppercase">T# {rp.tren || '---'}</span>
                                                                )}
                                                                <span className="text-foreground ml-1">{rp.nombre}</span>
                                                                {rp.manual_2 && <span className="text-muted-foreground ml-1 italic font-medium">({rp.manual_2})</span>}
                                                                {rp.coche_2 && <span className="ml-1 text-primary font-bold">[{rp.coche_2}]</span>}
                                                            </>
                                                        )}
 
                                                        <div className="inline-flex gap-2 ml-3">
                                                            {rp.s && <span><span className="text-primary/70 font-bold mr-0.5">S:</span><span className="text-foreground">{rp.s}</span></span>}
                                                            {rp.e && <span><span className="text-emerald-500/70 font-bold mr-0.5">E:</span><span className="text-foreground">{rp.e}</span></span>}
                                                            {rp.p && <span><span className="text-amber-500/70 font-bold mr-0.5">P:</span><span className="text-foreground">{rp.p}</span></span>}
                                                        </div>
                                                        {i < (registro.repuestos?.length || 0) - 1 && <span className="text-primary/50 ml-1">;</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-4">
                            <Wrench className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold mb-1">Técnicos Asignados</h4>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {(registro.tecnicos_involucrados || []).map(t => (
                                        <span key={t} className="px-2 py-1 bg-muted text-[10px] font-bold rounded-md border border-border">
                                            {t}
                                        </span>
                                    ))}
                                    {(!registro.tecnicos_involucrados || registro.tecnicos_involucrados.length === 0) && (
                                        <span className="text-xs italic text-muted-foreground">Sin técnicos asignados</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-muted/30 border-t border-border flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        Cerrar
                    </button>
                    {canEdit && (
                    <>
                    <button
                        onClick={() => onMove(registro)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm font-bold hover:bg-orange-500/20 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/10"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        Cambio Posición
                    </button>
                    <button
                        onClick={() => onEdit(registro)}
                        className="flex-1 btn-primary py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar Registro
                    </button>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
}
