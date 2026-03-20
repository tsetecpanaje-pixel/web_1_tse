'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Calendar as CalendarIcon, Train, User, MapPin, ChevronDown } from 'lucide-react';
import { TipoAtencion, LugarDestino } from '@/types/database';
import { useConfigTrenes } from '@/hooks/useConfig';
import { getModeloTren } from '@/lib/utils';

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder: string;
    icon: React.ReactNode;
    label: string;
}

function CustomSelect({ value, onChange, options, placeholder, icon, label }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = value || placeholder;

    return (
        <div className="space-y-1.5" ref={containerRef}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 ml-1">
                {icon} {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[13px] text-left flex items-center justify-between focus:ring-1 focus:ring-primary/50 outline-none transition-all hover:border-muted-foreground/30"
                >
                    <span className={value ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {selectedOption}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-2xl py-0.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                            <button
                                onClick={() => { onChange(''); setIsOpen(false); }}
                                className="w-full text-left px-2.5 py-1 text-[12px] hover:bg-muted/50 transition-colors text-muted-foreground italic border-b border-border/40"
                            >
                                {placeholder}
                            </button>
                            {options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => { onChange(option); setIsOpen(false); }}
                                    className={`w-full text-left px-2.5 py-1 text-[13px] transition-colors hover:bg-primary/20 hover:text-primary ${value === option ? 'bg-primary/20 text-primary font-bold' : 'text-foreground/80'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export interface FilterState {
    search: string;
    model: string;
    tipoAtencion: string;
    lugar: string;
    tecnico: string;
    fechaInicio: string;
    fechaFin: string;
    soloActivos: boolean;
    miniFiltros: string;
}

interface FilterPanelProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onReset: () => void;
    onBack?: () => void;
    tecnicos?: { nombre: string }[];
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const MODELOS = ['NS-74', 'NS-93', 'NS-16'];
const TIPOS_ATENCION = ['Avería', 'Mantenimiento Preventivo', 'O. Especial', 'Evacuación', 'Lavado', 'Estacionado', 'Cambio de Posición', 'Otro'];
const LUGARES = ['Foso 1', 'Foso 2', 'Foso 3', 'Foso 4', 'Foso 5', 'Foso 6', 'Nave Lavado', 'Vía Prueba', 'FV VV', 'FV PM', 'Cochera G14-1', 'Cochera G14-2', 'Cochera_1', 'Cochera_2', 'Cochera_3', 'Cochera_4'];
const MINI_FILTROS = ['MIT/MIF', 'Puertas', 'OR', 'CVS / NCB', 'Neumáticos', 'PA', 'Humo', 'Otros'];

export default function FilterPanel({
    filters,
    onFilterChange,
    onReset,
    onBack,
    tecnicos = [],
    isCollapsed = false,
    onToggleCollapse
}: FilterPanelProps) {
    const { trenes } = useConfigTrenes();
    const [showTrenSelector, setShowTrenSelector] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
                setShowTrenSelector(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (field: keyof FilterState, value: any) => {
        onFilterChange({ ...filters, [field]: value });
    };

    const trenColors = trenes.filter(t => t.activo).map(tren => ({
        numero: tren.numero,
        modelo: tren.modelo,
        colorClass: tren.modelo === 'NS-74'
            ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
            : tren.modelo === 'NS-93'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40'
    })).sort((a, b) => a.numero.localeCompare(b.numero, undefined, { numeric: true, sensitivity: 'base' }));

    return (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm mb-6 space-y-4">
            <div className="flex items-center justify-between">
                <div onClick={onToggleCollapse} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`p-2 rounded-xl border transition-all duration-300 ${isCollapsed ? 'bg-muted/50 border-border' : 'bg-primary/10 border-primary/20'}`}>
                        <Filter className={`w-5 h-5 transition-colors ${isCollapsed ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-left">Filtros Avanzados</h3>
                            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-500 ${isCollapsed ? '' : 'rotate-180'}`} />
                        </div>
                        <p className="text-[10px] text-muted-foreground opacity-70 text-left">
                            {isCollapsed ? 'Presiona para expandir filtros' : 'Búsqueda y segmentación de datos'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!isCollapsed && (
                        <button
                            onClick={onReset}
                            className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 opacity-60 hover:opacity-100 mr-2"
                        >
                            <X className="w-3 h-3" />
                            Limpiar
                        </button>
                    )}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all flex items-center gap-1"
                        >
                            ← Volver
                        </button>
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Búsqueda por Tren */}
                        <div className="space-y-1.5" ref={selectorRef}>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 ml-1">
                                <Search className="w-3 h-3" /> N° de Tren
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowTrenSelector(!showTrenSelector)}
                                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[13px] text-left flex items-center justify-between focus:ring-1 focus:ring-primary/50 outline-none transition-all hover:border-muted-foreground/30"
                                >
                                    <div className="flex items-center gap-2">
                                        <Train className={`w-3.5 h-3.5 ${filters.search ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className={filters.search ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                            {filters.search || 'Todos los trenes'}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${showTrenSelector ? 'rotate-180' : ''}`} />
                                </button>

                                {showTrenSelector && (
                                    <div className="absolute z-[100] w-[280px] sm:w-[320px] mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-2 border-b border-border bg-muted/20">
                                            <button
                                                onClick={() => { handleChange('search', ''); setShowTrenSelector(false); }}
                                                className="w-full text-center py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-muted rounded transition-colors text-muted-foreground"
                                            >
                                                Limpiar Selección
                                            </button>
                                        </div>
                                        <div className="p-2 grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                                            {trenColors.map((item) => (
                                                <button
                                                    key={item.numero}
                                                    type="button"
                                                    onClick={() => {
                                                        handleChange('search', item.numero);
                                                        setShowTrenSelector(false);
                                                    }}
                                                    className={`
                                                        relative p-2 rounded-lg border transition-all duration-200 hover:scale-105
                                                        ${filters.search === item.numero
                                                            ? `${item.colorClass} border-primary shadow-sm`
                                                            : `bg-muted/10 border-border hover:border-primary/50`
                                                        }
                                                    `}
                                                >
                                                    <span className={`text-[13px] font-black leading-none block ${filters.search === item.numero ? 'opacity-100' : 'opacity-80'}`}>
                                                        {item.numero}
                                                    </span>
                                                    <span className={`text-[8px] font-bold block mt-0.5 opacity-50 truncate`}>
                                                        {item.modelo}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modelo */}
                        <CustomSelect
                            label="Modelo"
                            icon={<Train className="w-3 h-3" />}
                            value={filters.model}
                            onChange={(val) => handleChange('model', val)}
                            options={MODELOS}
                            placeholder="Todos los modelos"
                        />

                        {/* Tipo de Atención */}
                        <CustomSelect
                            label="Tipo Atención"
                            icon={<Filter className="w-3 h-3" />}
                            value={filters.tipoAtencion}
                            onChange={(val) => handleChange('tipoAtencion', val)}
                            options={TIPOS_ATENCION}
                            placeholder="Todos los tipos"
                        />

                        {/* Técnico */}
                        <CustomSelect
                            label="Técnico"
                            icon={<User className="w-3 h-3" />}
                            value={filters.tecnico}
                            onChange={(val) => handleChange('tecnico', val)}
                            options={tecnicos.map(t => t.nombre)}
                            placeholder="Todos los técnicos"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-border/50">
                        {/* Lugar */}
                        <CustomSelect
                            label="Ubicación"
                            icon={<MapPin className="w-3 h-3" />}
                            value={filters.lugar}
                            onChange={(val) => handleChange('lugar', val)}
                            options={LUGARES}
                            placeholder="Todas las ubicaciones"
                        />

                        {/* Mini Filtros */}
                        <CustomSelect
                            label="Mini Filtros"
                            icon={<Filter className="w-3 h-3" />}
                            value={filters.miniFiltros}
                            onChange={(val) => handleChange('miniFiltros', val)}
                            options={MINI_FILTROS}
                            placeholder="Todos los filtros"
                        />

                        {/* Fecha Inicio */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 ml-1">
                                <CalendarIcon className="w-3 h-3" /> Desde
                            </label>
                            <input
                                type="date"
                                value={filters.fechaInicio}
                                onChange={(e) => handleChange('fechaInicio', e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[13px] focus:ring-1 focus:ring-primary/50 outline-none text-muted-foreground/80 transition-all hover:border-muted-foreground/30"
                            />
                        </div>

                        {/* Fecha Fin */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 ml-1">
                                <CalendarIcon className="w-3 h-3" /> Hasta
                            </label>
                            <input
                                type="date"
                                value={filters.fechaFin}
                                onChange={(e) => handleChange('fechaFin', e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[13px] focus:ring-1 focus:ring-primary/50 outline-none text-muted-foreground/80 transition-all hover:border-muted-foreground/30"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end pt-2">
                        <button
                            onClick={() => handleChange('soloActivos', !filters.soloActivos)}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${filters.soloActivos
                                ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                                }`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${filters.soloActivos ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                            Solo en Taller
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
