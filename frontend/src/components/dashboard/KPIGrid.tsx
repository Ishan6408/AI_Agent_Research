import type { AnalyticsOverview } from '../../types/api';
import { KPICard } from './KPICard';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard title="Total Experiments" value={data.total_experiments ?? 'N/A'} />
      <KPICard title="Average Performance" value={formatDec(data.avg_performance_score, 1)} />
      <KPICard title="Average Honesty" value={formatDec(data.avg_honesty_score, 1)} />
      <KPICard title="Detection Rate" value={formatPct(data.detection_rate_pct)} />
      
      <KPICard title="Average Bugs" value={formatDec(data.avg_bugs_introduced, 2)} />
      <KPICard title="Average Code Quality" value={formatDec(data.avg_code_quality, 2)} />
      <KPICard title="Average Stress" value={formatDec(data.avg_stress_index, 2)} />
      <KPICard title="Average Auditor Score" value={formatDec(data.avg_auditor_score, 2)} />
    </div>
  );
}
