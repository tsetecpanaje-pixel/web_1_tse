'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { RegistroTren } from '@/types/database';
import { X, TrendingUp, Filter, Calendar } from 'lucide-react';

interface TrainAnalysisModalProps {
    trainNumber: string;
    registros: RegistroTren[];
    onClose: () => void;
    onFilterClick?: (filters: { tren?: string; mini_filtros?: string; tipo_atencion?: string }) => void;
}

// Fixed color mappings
const MINI_FILTRO_COLORS: Record<string, string> = {
    'MIT/MIF': '#10B981', // Verde
    'Otros': '#3B82F6',   // Azul
    'Otros ': '#3B82F6',  // Azul (fallback)
    'PA': '#FACC15',      // Amarillo
    'Puertas': '#EF4444', // Rojo
    'Humo': '#A855F7',    // Lila
    'OR': '#F97316',      // Naranja
    'CVS / NCB': '#06B6D4', // Cyan
    'Neumáticos': '#64748B', // Slate
};

const ATTENTION_COLORS: Record<string, string> = {
    'Avería': '#F97316',
    'Mantenimiento Preventivo': '#10B981',
    'O. Especial': '#FACC15',
    'Evacuación': '#D97706',
    'Lavado': '#FDE047',
    'Estacionado': '#F59E0B',
    'Cambio de Posición': '#84CC16',
    'Otro': '#064E3B',
};

const DEFAULT_COLOR = '#64748B';

export default function TrainAnalysisModal({ trainNumber, registros, onClose, onFilterClick }: TrainAnalysisModalProps) {
    const [daysRange] = useState(60);

    // Filter to last 60 days and specific train
    const rangeDate = new Date();
    rangeDate.setDate(rangeDate.getDate() - daysRange);

    const trainRegistros = useMemo(() => {
        return registros.filter(r =>
            r.tren === trainNumber &&
            new Date(r.fecha_hora_entrada) >= rangeDate
        );
    }, [registros, trainNumber, rangeDate]);

    // Process data for MiniFiltros chart
    const miniFiltrosData = useMemo(() => {
        const counts: Record<string, number> = {
            'MIT/MIF': 0,
            'Puertas': 0,
            'OR': 0,
            'CVS / NCB': 0,
            'Neumáticos': 0,
            'PA': 0,
            'Humo': 0,
            'Otros': 0
        };

        trainRegistros.forEach(reg => {
            if (reg.mini_filtros && counts[reg.mini_filtros] !== undefined) {
                counts[reg.mini_filtros]++;
            } else if (reg.mini_filtros) {
                counts['Otros']++;
            }
        });

        return Object.entries(counts)
            .map(([name, total]) => ({ name, total }))
            .filter(item => item.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [trainRegistros]);

    // Process data for attention types
    const attentionData = useMemo(() => {
        const counts: Record<string, number> = {};
        trainRegistros.forEach(reg => {
            counts[reg.tipo_atencion] = (counts[reg.tipo_atencion] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [trainRegistros]);

    const customTooltipStyle = {
        backgroundColor: '#DCFCE7', // Light green (bg-green-100/green-50)
        border: '1px solid #BBF7D0',
        borderRadius: '12px',
        color: '#000000',
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '8px 12px'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 sm:p-8 flex items-center justify-between bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
                            <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Análisis Tren {trainNumber}</h2>
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Últimos {daysRange} días • {trainRegistros.length} registros
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                    {/* Insights Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-muted/30 p-5 rounded-3xl border border-border/40 flex flex-col justify-between">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Entradas</span>
                            <span className="text-3xl font-black">{trainRegistros.length}</span>
                        </div>
                        <div className="bg-muted/30 p-5 rounded-3xl border border-border/40 flex flex-col justify-between">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Mini Filtro Principal</span>
                            <span className="text-xl font-black truncate">{miniFiltrosData[0]?.name || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Mini Filtros Chart */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Filter className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Distribución por Mini Filtros</h3>
                            </div>
                            <div className="h-[250px] sm:h-[300px] w-full bg-muted/20 rounded-3xl p-4 border border-border/40 group/chart">
                                {miniFiltrosData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={miniFiltrosData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#ffffff05" />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={100}
                                                stroke="#94A3B8"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                                contentStyle={customTooltipStyle}
                                                itemStyle={{ color: '#000000' }}
                                                labelStyle={{ color: '#000000', marginBottom: '4px' }}
                                            />
                                            <Bar
                                                dataKey="total"
                                                radius={[0, 4, 4, 0]}
                                                barSize={20}
                                                onClick={(data) => {
                                                    if (data && data.name) {
                                                        onFilterClick?.({ tren: trainNumber, mini_filtros: data.name });
                                                    }
                                                }}
                                                className="cursor-pointer"
                                            >
                                                {miniFiltrosData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={MINI_FILTRO_COLORS[entry.name] || DEFAULT_COLOR}
                                                        className="hover:opacity-80 transition-opacity"
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                        <Filter className="w-12 h-12 mb-2" />
                                        <p className="text-xs font-bold uppercase">Sin datos de mini filtros</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attention Type Distribution */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-orange-400" />
                                <h3 className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Tipos de Atención</h3>
                            </div>
                            <div className="h-[250px] sm:h-[300px] w-full bg-muted/20 rounded-3xl p-4 border border-border/40 flex items-center justify-center">
                                {attentionData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={attentionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                onClick={(data) => {
                                                    if (data && data.name) {
                                                        onFilterClick?.({ tren: trainNumber, tipo_atencion: data.name });
                                                    }
                                                }}
                                                className="cursor-pointer outline-none"
                                            >
                                                {attentionData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={ATTENTION_COLORS[entry.name] || DEFAULT_COLOR}
                                                        className="hover:opacity-80 transition-opacity outline-none"
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={customTooltipStyle}
                                                itemStyle={{ color: '#000000' }}
                                                labelStyle={{ color: '#000000' }}
                                            />
                                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-black text-xs">
                                                TOTAL: {trainRegistros.length}
                                            </text>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-muted-foreground">Sin datos registrados</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-muted/10 border-t border-border/40 text-[10px] text-center text-muted-foreground font-black uppercase tracking-widest">
                    Análisis Automatizado - Taller Línea 5
                </div>
            </div>
        </div>
    );
}
