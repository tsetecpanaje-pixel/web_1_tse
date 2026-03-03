import { ReactNode } from 'react';

interface DashboardCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: ReactNode;
    trend?: string;
    color: 'green' | 'orange' | 'blue' | 'red';
}

export default function DashboardCard({ title, value, subtitle, icon, trend, color }: DashboardCardProps) {
    const colorClasses = {
        green: 'text-green-400 bg-green-400/10',
        orange: 'text-orange-400 bg-orange-400/10',
        blue: 'text-blue-400 bg-blue-400/10',
        red: 'text-red-400 bg-red-400/10',
    };

    return (
        <div className="dashboard-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>

            <div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{value}</span>
                    {trend && (
                        <span className="text-xs font-medium text-green-400">{trend}</span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </div>
        </div>
    );
}
