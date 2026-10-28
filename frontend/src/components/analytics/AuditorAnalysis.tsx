import { api } from '../../services/api';
import type { AuditorAnalysis as AuditorAnalysisType } from '../../types/api';
import AnalysisChartCard from './AnalysisChartCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useApiData } from '../../hooks/useApiData';
import { KPISkeleton, ChartSkeleton, BackgroundRefreshBadge, RevalidateErrorBanner } from '../common/Skeleton';

const COLORS = ['#ef4444', '#f87171', '#fca5a5', '#b91c1c', '#7f1d1d'];

export default function AuditorAnalysis() {
  const {
    data,
    isLoading: isInitialLoading,
    isValidating,
    error,
    revalidateError,
    lastUpdated,
    refetch,
  } = useApiData<AuditorAnalysisType>('analytics/auditor', api.getAuditor);

  if (error && !data) {
    return (
      <div className="p-6 bg-red-900/50 border border-red-500 rounded-xl">
        <p className="text-red-200 mb-4 font-mono text-sm">{error.message || 'Failed to fetch auditor data'}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-mono uppercase tracking-widest cursor-pointer transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isInitialLoading && !data) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          <KPISkeleton accent="border-red-500/20" />
          <KPISkeleton accent="border-red-500/20" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton title="Auditor Score Distribution" height="h-[360px]" className="lg:col-span-2" />
          <ChartSkeleton title="Detection Rate by Pressure" height="h-[360px]" />
          <ChartSkeleton title="Average Auditor Score by Pressure" height="h-[360px]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-slate-400 p-4 font-mono text-sm uppercase">No experiment data available yet.</div>;
  }

  const { score_distribution = [], detection_by_pressure = [], score_by_pressure = [] } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Top action / status bar */}
      <div className="flex justify-between items-center px-2">
        <BackgroundRefreshBadge
          isValidating={isValidating}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
        />
      </div>

      <RevalidateErrorBanner error={revalidateError} onRetry={refetch} />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-inner">
          <h4 className="text-white/60 text-xs font-mono tracking-widest uppercase mb-2">Overall Detection Rate</h4>
          <p className="text-4xl font-black text-white font-mono tabular-nums">
            {data.overall_detection_rate != null ? `${data.overall_detection_rate.toFixed(1)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-inner">
          <h4 className="text-white/60 text-xs font-mono tracking-widest uppercase mb-2">Average Auditor Score</h4>
          <p className="text-4xl font-black text-white font-mono tabular-nums">
            {data.overall_avg_auditor_score != null ? data.overall_avg_auditor_score.toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Full width chart for distribution */}
        <div className="lg:col-span-2 border border-white/5 bg-black/20 p-2 rounded-xl">
          <AnalysisChartCard title="Auditor Score Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={score_distribution} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="bucket" stroke="#ffffff" strokeOpacity={0.5} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#ffffff" strokeOpacity={0.5} allowDecimals={false} className="tabular-nums font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#333333', color: '#ffffff' }}
                  cursor={{ fill: '#ffffff', opacity: 0.05 }}
                  formatter={(val: any) => [`${val}`, 'Count']}
                />
                <Bar dataKey="count" name="Count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>

        <div className="border border-white/5 bg-black/20 p-2 rounded-xl">
          <AnalysisChartCard title="Detection Rate by Pressure">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detection_by_pressure} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="pressure" stroke="#ffffff" strokeOpacity={0.5} />
                <YAxis stroke="#ffffff" strokeOpacity={0.5} domain={[0, 100]} tickFormatter={(val) => `${val}%`} className="tabular-nums font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#333333', color: '#ffffff' }}
                  cursor={{ fill: '#ffffff', opacity: 0.05 }}
                  formatter={(val: any) => [`${typeof val === 'number' ? val.toFixed(1) : val}%`, 'Detection Rate']}
                />
                <Bar dataKey="detection_rate_pct" name="Detection Rate">
                  {detection_by_pressure.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>

        <div className="border border-white/5 bg-black/20 p-2 rounded-xl">
          <AnalysisChartCard title="Average Auditor Score by Pressure">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={score_by_pressure} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="pressure" stroke="#ffffff" strokeOpacity={0.5} />
                <YAxis stroke="#ffffff" strokeOpacity={0.5} domain={[0, 100]} className="tabular-nums font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#333333', color: '#ffffff' }}
                  cursor={{ fill: '#ffffff', opacity: 0.05 }}
                  formatter={(val: any) => [`${typeof val === 'number' ? val.toFixed(2) : val}`, 'Auditor Score']}
                />
                <Bar dataKey="auditor_score" name="Auditor Score">
                  {score_by_pressure.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>
      </div>
    </div>
  );
}
