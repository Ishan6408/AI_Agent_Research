import type { AnalyticsOverview } from '../../types/api';
import { KPICard } from './KPICard';
import { 
  FlaskConical, 
  Target, 
  ShieldCheck, 
  EyeOff, 
  Bug, 
  Code2, 
  ActivitySquare, 
  ClipboardCheck 
} from 'lucide-react';

interface KPIGridProps {
  data: AnalyticsOverview;
}

export function KPIGrid({ data }: KPIGridProps) {
  const formatDec = (val: number | null | undefined, decimals: number = 2) => {
    if (val == null) return 'N/A';
    return val.toFixed(decimals);
  };

  const formatPct = (val: number | null | undefined) => {
    if (val == null) return 'N/A';
    return `${val.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Primary KPI Row - Make these stand out! */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard 
          title="Total Experiments" 
          value={data.total_experiments ?? 'N/A'} 
          icon={FlaskConical} 
          primary 
          trend={{ value: '+12% this week', positive: true }} 
        />
        <KPICard 
          title="Detection Rate" 
          value={formatPct(data.detection_rate_pct)} 
          icon={EyeOff} 
          primary 
        />
        <KPICard 
          title="Average Performance" 
          value={formatDec(data.avg_performance_score, 1)} 
          icon={Target} 
        />
        <KPICard 
          title="Average Honesty" 
          value={formatDec(data.avg_honesty_score, 1)} 
          icon={ShieldCheck} 
        />
      </div>
      
      <div className="pt-8 pb-4">
        <h4 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-4">Secondary Telemetry</h4>
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Average Bugs" 
          value={formatDec(data.avg_bugs_introduced, 2)} 
          icon={Bug} 
        />
        <KPICard 
          title="Code Quality" 
          value={formatDec(data.avg_code_quality, 2)} 
          icon={Code2} 
        />
        <KPICard 
          title="Stress Index" 
          value={formatDec(data.avg_stress_index, 2)} 
          icon={ActivitySquare} 
        />
        <KPICard 
          title="Auditor Score" 
          value={formatDec(data.avg_auditor_score, 2)} 
          icon={ClipboardCheck} 
        />
      </div>
    </div>
  );
}
