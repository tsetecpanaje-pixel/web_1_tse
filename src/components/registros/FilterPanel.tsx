'use client';

import React from 'react';
import { Search, Filter, X, Calendar as CalendarIcon, Train, User, MapPin } from 'lucide-react';
import { TipoAtencion, LugarDestino } from '@/types/database';

export interface FilterState {
    search: string;
    model: string;
    tipoAtencion: string;
    lugar: string;
    tecnico: string;
    fechaInicio: string;
    fechaFin: string;
    soloActivos: boolean;
}

interface FilterPanelProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onReset: () => void;
}

const MODELOS = ['NS-74', 'NS-93', 'NS-16', 'Otros'];
const TIPOS_ATENCION: TipoAtencion[] = ['Avería', 'Mantenimiento Preventivo', 'O. Especial', 'Evacuación', 'Lavado', 'Estacionado', 'Otro'];
const LUGARES: LugarDestino[] = ['Foso 1', 'Foso 2', 'Foso 3', 'Foso 4', 'Foso 5', 'Foso 6', 'Nave Lavado', 'Vía Prueba', 'FV VV', 'FV PM', 'Cochera G14-1', 'Cochera G14-2', 'Cochera'];

export default function FilterPanel({ filters, onFilterChange, onReset }: FilterPanelProps) {
    const handleChange = (field: keyof FilterState, value: any) => {
        onFilterChange({ ...filters, [field]: value });
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Filtros Avanzados</h3>
                </div>
                <button
                    onClick={onReset}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                    <X className="w-3 h-3" />
                    Limpiar Filtros
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Búsqueda por Tren */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Search className="w-3 h-3" /> Búsqueda
                    </label>
                    <input
                        type="text"
                        placeholder="N° de Tren..."
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    />
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Train className="w-3 h-3" /> Modelo
                    </label>
                    <select
                        value={filters.model}
                        onChange={(e) => handleChange('model', e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    >
                        <option value="">Todos los modelos</option>
                        {MODELOS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {/* Tipo de Atención */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Filter className="w-3 h-3" /> Tipo Atención
                    </label>
                    <select
                        value={filters.tipoAtencion}
                        onChange={(e) => handleChange('tipoAtencion', e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    >
                        <option value="">Todos los tipos</option>
                        {TIPOS_ATENCION.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Técnico */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Técnico
                    </label>
                    <input
                        type="text"
                        placeholder="Nombre técnico..."
                        value={filters.tecnico}
                        onChange={(e) => handleChange('tecnico', e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-border/50">
                {/* Lugar */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> Ubicación
                    </label>
                    <select
                        value={filters.lugar}
                        onChange={(e) => handleChange('lugar', e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    >
                        <option value="">Todas las ubicaciones</option>
                        {LUGARES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                {/* Fecha Inicio */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <CalendarIcon className="w-3 h-3" /> Desde
                    </label>
                    <input
                        type="date"
                        value={filters.fechaInicio}
                        onChange={(e) => handleChange('fechaInicio', e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    />
                </div>

                {/* Fecha Fin */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <CalendarIcon className="w-3 h-3" /> Hasta
                    </label>
                    <input
                        type="date"
                        value={filters.fechaFin}
                        onChange={(e) => handleChange('fechaFin', e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    />
                </div>

                {/* Status Toggle */}
                <div className="flex flex-col justify-end pb-1">
                    <button
                        onClick={() => handleChange('soloActivos', !filters.soloActivos)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm font-semibold ${filters.soloActivos
                                ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]'
                                : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${filters.soloActivos ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                        Solo en Taller
                    </button>
                </div>
            </div>
        </div>
    );
}
