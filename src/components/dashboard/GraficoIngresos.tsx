'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RegistroTren } from '@/types/database';

interface GraficoIngresosProps {
    registros: RegistroTren[];
}

export default function GraficoIngresos({ registros }: GraficoIngresosProps) {
    // Process data for the chart: Count entries per train
    const dataMap = registros.reduce((acc: Record<string, number>, curr) => {
        acc[curr.tren] = (acc[curr.tren] || 0) + 1;
        return acc;
    }, {});

    const data = Object.entries(dataMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10); // Show top 10 trains

    return (
        <div className="dashboard-card p-4 sm:p-6 h-[300px] sm:h-[400px] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl opacity-50" />

            <div className="mb-4 sm:mb-6 relative z-10">
                <h3 className="text-sm sm:text-lg font-black tracking-tight uppercase sm:capitalize">Frecuencia de Ingresos por Tren</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground font-medium opacity-70">Top 10 trenes con más registros registrados</p>
            </div>

            <div className="flex-1 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                            allowDecimals={false}
                            dx={-5}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: '#F8FAFC',
                                backdropFilter: 'blur(8px)',
                                fontSize: '11px',
                                fontWeight: 'bold'
                            }}
                        />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={window?.innerWidth < 640 ? 15 : 30}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.name === '55' ? '#F97316' : entry.name === '24' ? '#10B981' : '#3B82F6'}
                                    fillOpacity={0.8}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
