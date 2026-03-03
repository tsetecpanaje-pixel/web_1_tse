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
        <div className="dashboard-card p-6 h-[400px] flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold">Frecuencia de Ingresos por Tren</h3>
                <p className="text-sm text-muted-foreground">Top 10 trenes con más registros registrados</p>
            </div>

            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#94A3B8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94A3B8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#F8FAFC'
                            }}
                        />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.name === '55' ? '#F97316' : entry.name === '24' ? '#10B981' : '#3B82F6'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
