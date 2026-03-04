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
        <div className="dashboard-card p-3.5 sm:p-6 flex flex-col gap-2 sm:gap-4 relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
                <span className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
                <div className={`p-1 sm:p-2 rounded-lg ${colorClasses[color]} transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
            </div>

            <div className="relative z-10 text-left">
                <div className="flex items-baseline gap-1.5 overflow-hidden">
                    <span className="text-xl sm:text-3xl font-black tracking-tighter truncate">{value}</span>
                    {trend && (
                        <span className="text-[8px] sm:text-xs font-bold text-green-400 whitespace-nowrap">{trend}</span>
                    )}
                </div>
                <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 font-medium opacity-80 leading-tight line-clamp-1">{subtitle}</p>
            </div>

            {/* Subtle background glow */}
            <div className={`absolute -bottom-6 -right-6 w-16 h-16 rounded-full blur-3xl opacity-20 ${colorClasses[color].split(' ')[1]}`} />
        </div>
    );
}
