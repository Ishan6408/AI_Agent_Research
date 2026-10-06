import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  primary?: boolean;
  trend?: { value: string; positive: boolean };
}

export function KPICard({ title, value, icon: Icon, trend }: KPICardProps) {
  return (
    <div className="flex flex-col justify-between p-6 border-l-2 border-primary/40 bg-card rounded-md">
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="text-primary">
            <Icon size={20} strokeWidth={1.5} />
          </div>
        )}
        <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </h3>
      </div>
      
      <div>
        <p className="text-5xl font-mono tracking-tighter text-foreground">
          {value}
        </p>
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span className={`text-xs font-mono uppercase tracking-wider ${
              trend.positive ? 'text-emerald-400' : 'text-destructive'
            }`}>
              {trend.positive ? '↗' : '↘'} {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
