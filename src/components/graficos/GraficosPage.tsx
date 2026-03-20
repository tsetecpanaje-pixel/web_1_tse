'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RegistroTren, MiniFiltros } from '@/types/database';
import { BarChart3, Calendar, ChevronLeft, Filter, Info } from 'lucide-react';

interface GraficosPageProps {
    registros: RegistroTren[];
    onBack: () => void;
    onFilterClick: (filters: { tren?: string; mini_filtros?: string }) => void;
}

const MINI_FILTROS: MiniFiltros[] = ['MIT/MIF', 'Puertas', 'OR', 'CVS / NCB', 'Neumáticos', 'PA', 'Humo', 'Otros'];

const MINI_FILTRO_COLORS: Record<string, string> = {
    'MIT/MIF': '#10B981', // Verde
    'Otros': '#3B82F6',   // Azul
    'PA': '#FACC15',      // Amarillo
    'Puertas': '#EF4444', // Rojo
    'Humo': '#A855F7',    // Lila
    'OR': '#F97316',      // Naranja
    'CVS / NCB': '#06B6D4', // Cyan
    'Neumáticos': '#64748B', // Slate
};

export default function GraficosPage({ registros, onBack, onFilterClick }: GraficosPageProps) {
    const [daysRange, setDaysRange] = useState(30);

    const filteredRangeDate = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - daysRange);
        return date;
    }, [daysRange]);

    const rangeRegistros = useMemo(() => {
        return registros.filter(r => new Date(r.fecha_hora_entrada) >= filteredRangeDate);
    }, [registros, filteredRangeDate]);

    const getChartDataForMiniFiltro = (miniFiltro: MiniFiltros) => {
        const counts: Record<string, number> = {};
        rangeRegistros
            .filter(r => r.mini_filtros === miniFiltro)
            .forEach(r => {
                counts[r.tren] = (counts[r.tren] || 0) + 1;
            });

        return Object.entries(counts)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    };

    const tooltipStyle = {
        backgroundColor: '#DCFCE7', // Light green
        border: '1px solid #BBF7D0',
        borderRadius: '12px',
        color: '#000000',
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '8px 12px'
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-3 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95 border border-border/40"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <BarChart3 className="w-8 h-8 text-primary" />
                            Análisis por Mini Filtros
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium">Estadísticas de ingresos de los últimos 10 trenes por categoría</p>
                    </div>
                </div>

                {/* Range Selector */}
                <div className="bg-card/30 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-border/40 flex items-center gap-1">
                    {[7, 15, 30].map((range) => (
                        <button
                            key={range}
                            onClick={() => setDaysRange(range)}
                            className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${daysRange === range
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-100'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground grayscale'
                                }`}
                        >
                            {range} Días
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid of charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 pb-10">
                {MINI_FILTROS.map((mf) => {
                    const data = getChartDataForMiniFiltro(mf);
                    const color = MINI_FILTRO_COLORS[mf] || '#64748B';

                    return (
                        <div key={mf} className="dashboard-card p-6 flex flex-col min-h-[350px] relative overflow-hidden group">
                            {/* Decorative accent */}
                            <div
                                className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
                                style={{ backgroundColor: color }}
                            />

                            <div className="mb-6 flex items-center justify-between relative z-10">
                                <div>
                                    <h3
                                        className="text-lg font-black uppercase tracking-tight flex items-center gap-2"
                                        style={{ color: color }}
                                    >
                                        <Filter className="w-4 h-4" />
                                        {mf}
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">
                                        Top 10 trenes con más ingresos
                                    </p>
                                </div>
                                <div className="p-2 bg-muted/40 rounded-xl text-[10px] font-black border border-border/40">
                                    {rangeRegistros.filter(r => r.mini_filtros === mf).length} TOTAL
                                </div>
                            </div>

                            <div className="flex-1 w-full relative z-10">
                                {data.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#94A3B8"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={5}
                                            />
                                            <YAxis
                                                stroke="#94A3B8"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                                dx={-5}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                                contentStyle={tooltipStyle}
                                                itemStyle={{ color: '#000000' }}
                                                labelStyle={{ color: '#000000', marginBottom: '4px' }}
                                            />
                                            <Bar
                                                dataKey="total"
                                                radius={[6, 6, 0, 0]}
                                                barSize={30}
                                                onClick={(clickedData) => {
                                                    if (clickedData && clickedData.name) {
                                                        onFilterClick({ tren: clickedData.name, mini_filtros: mf });
                                                    }
                                                }}
                                                className="cursor-pointer"
                                            >
                                                {data.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={color}
                                                        fillOpacity={0.7}
                                                        className="hover:fill-opacity-100 transition-all duration-300"
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 border-2 border-dashed border-border/40 rounded-3xl">
                                        <Info className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Sin datos en este rango</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
