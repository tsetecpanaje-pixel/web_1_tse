'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Calendar as CalendarIcon, Train, User, MapPin, ChevronDown } from 'lucide-react';
import { TipoAtencion, LugarDestino } from '@/types/database';

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
    tecnicos?: { nombre: string }[];
}

const MODELOS = ['NS-74', 'NS-93', 'NS-16'];
const TIPOS_ATENCION = ['Avería', 'Mantenimiento Preventivo', 'O. Especial', 'Evacuación', 'Lavado', 'Estacionado', 'Cambio de Posición', 'Otro'];
const LUGARES = ['Foso 1', 'Foso 2', 'Foso 3', 'Foso 4', 'Foso 5', 'Foso 6', 'Nave Lavado', 'Vía Prueba', 'FV VV', 'FV PM', 'Cochera G14-1', 'Cochera G14-2', 'Cochera_1', 'Cochera_2', 'Cochera_3', 'Cochera_4'];
const MINI_FILTROS = ['MIT/MIF', 'Puertas', 'OR', 'CVS / NCB', 'Neumáticos', 'PA', 'Humo', 'Otros'];

export default function FilterPanel({ filters, onFilterChange, onReset, tecnicos = [] }: FilterPanelProps) {
    const handleChange = (field: keyof FilterState, value: any) => {
        onFilterChange({ ...filters, [field]: value });
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm mb-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Filtros Avanzados</h3>
                </div>
                <button
                    onClick={onReset}
                    className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 opacity-60 hover:opacity-100"
                >
                    <X className="w-3 h-3" />
                    Limpiar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda por Tren */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 ml-1">
                        <Search className="w-3 h-3" /> Búsqueda
                    </label>
                    <input
                        type="text"
                        placeholder="N° de Tren..."
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[13px] focus:ring-1 focus:ring-primary/50 outline-none hover:border-muted-foreground/30 transition-all placeholder:text-muted-foreground/40"
                    />
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
    );
}
