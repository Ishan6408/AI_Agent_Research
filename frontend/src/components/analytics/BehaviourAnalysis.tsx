import { forwardRef, useImperativeHandle } from 'react';
import { api } from '../../services/api';
import type { DatasetRecord, GroupAnalysisRow, AnalyticsOverview } from '../../types/api';
import AnalysisChartCard from './AnalysisChartCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  Legend
} from 'recharts';
import { useApiData } from '../../hooks/useApiData';
import { KPISkeleton, ChartSkeleton, RevalidateErrorBanner } from '../common/Skeleton';

// Sleek, modern tech colors
const COLORS = ['#818cf8', '#a78bfa', '#34d399', '#f472b6', '#60a5fa', '#fbbf24'];

export interface BehaviourAnalysisRef {
  fetchData: () => Promise<void>;
  hasData: boolean;
}

// Custom tooltip declared outside render for React 19 / linter purity
const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0f1115]/95 p-4 border border-slate-700 rounded-xl shadow-xl text-sm backdrop-blur-md">
        <p className="text-slate-100 font-medium mb-3 border-b border-slate-800 pb-2">{data.behavior_strategy}</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <span className="text-slate-400">Actual Progress</span>
          <span className="text-right text-slate-200 font-medium tabular-nums font-mono">{data.actual_progress?.toFixed(1)}%</span>
          <span className="text-slate-400">Reported Progress</span>
          <span className="text-right text-slate-200 font-medium tabular-nums font-mono">{data.reported_progress?.toFixed(1)}%</span>
          <span className="text-slate-400">Deception Gap</span>
          <span className="text-right text-rose-400 font-medium tabular-nums font-mono">
            {data.deception_gap > 0 ? '+' : ''}{data.deception_gap?.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const BehaviourAnalysis = forwardRef<BehaviourAnalysisRef, {}>((_props, ref) => {
  const {
    data: dataset,
    isLoading: isDatasetLoading,
    error: datasetError,
    revalidateError: datasetRevalError,
    refetch: refetchDataset,
  } = useApiData<DatasetRecord[]>('dataset/records', api.getDataset);

  const {
    data: personalityData,
    isLoading: isPersonalityLoading,
    error: personalityError,
    revalidateError: personalityRevalError,
    refetch: refetchPersonality,
  } = useApiData<GroupAnalysisRow[]>('analytics/personality', api.getPersonality);

  const {
    data: overview,
    isLoading: isOverviewLoading,
    error: overviewError,
    revalidateError: overviewRevalError,
    refetch: refetchOverview,
  } = useApiData<AnalyticsOverview>('analytics/overview', api.getAnalyticsOverview);

  const handleFetchAll = async () => {
    await Promise.all([refetchDataset(), refetchPersonality(), refetchOverview()]);
  };

  useImperativeHandle(ref, () => ({
    fetchData: handleFetchAll,
    hasData: !!dataset && dataset.length > 0,
  }));

  const isLoading = (isDatasetLoading && !dataset) || (isPersonalityLoading && !personalityData) || (isOverviewLoading && !overview);
  const blockingError = (!dataset && datasetError) || (!personalityData && personalityError) || (!overview && overviewError);
  const revalidateError = datasetRevalError || personalityRevalError || overviewRevalError;

  if (blockingError) {
    return (
      <div className="p-6 bg-rose-950/30 border border-rose-900/50 rounded-2xl">
        <p className="text-rose-400 mb-4 text-sm font-mono">{blockingError.message || 'Failed to fetch behaviour data'}</p>
        <button
          onClick={handleFetchAll}
          className="px-4 py-2 bg-rose-900/50 hover:bg-rose-800 border border-rose-700 text-rose-100 rounded-lg transition-all text-xs font-mono uppercase tracking-wider cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPISkeleton />
          <KPISkeleton />
          <KPISkeleton />
          <KPISkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton title="Actual vs Reported Progress (Deception Mapping)" height="h-[380px]" className="lg:col-span-2" />
          <ChartSkeleton title="Performance by Personality" height="h-[340px]" />
          <ChartSkeleton title="Honesty by Personality" height="h-[340px]" />
          <ChartSkeleton title="Deception Gap Distribution" height="h-[340px]" className="lg:col-span-2" />
        </div>
      </div>
    );
  }

  const datasetList = dataset || [];
  const personalityList = personalityData || [];

  if (datasetList.length === 0 && personalityList.length === 0) {
    return (
      <div className="text-slate-500 p-6 text-sm text-center bg-slate-900/30 border border-slate-800 rounded-2xl font-mono uppercase">
        No behavior data available.
      </div>
    );
  }

  // Process data for scatter
  const scatterData = datasetList.map(d => ({
    actual_progress: d.actual_progress,
    reported_progress: d.reported_progress,
    behavior_strategy: d.behavior_strategy,
    deception_gap: d.deception_gap,
  }));

  // Group by behavior_strategy for colors
  const strategies = Array.from(new Set(datasetList.map(d => d.behavior_strategy)));

  // Histogram logic for Deception Gap
  const numBins = 20;
  const gaps = datasetList.map(d => d.deception_gap).filter(g => g !== undefined && g !== null) as number[];
  const minGap = gaps.length > 0 ? Math.min(...gaps, 0) : 0;
  const maxGap = gaps.length > 0 ? Math.max(...gaps, 100) : 100;
  const binSize = (maxGap - minGap) / numBins || 5;

  const bins: { binStr: string; binMid: number; count: number; [key: string]: any }[] = [];
  for (let i = 0; i < numBins; i++) {
    const start = minGap + i * binSize;
    const end = start + binSize;
    bins.push({
      binStr: `${start.toFixed(1)} to ${end.toFixed(1)}`,
      binMid: (start + end) / 2,
      count: 0
    });
  }

  datasetList.forEach(d => {
    if (d.deception_gap == null) return;
    let binIdx = Math.floor((d.deception_gap - minGap) / binSize);
    if (binIdx >= numBins) binIdx = numBins - 1;
    if (binIdx < 0) binIdx = 0;

    const strategy = d.behavior_strategy || 'Unknown';
    if (!bins[binIdx][strategy]) {
      bins[binIdx][strategy] = 0;
    }
    bins[binIdx][strategy] += 1;
    bins[binIdx].count += 1;
  });

  // Calculate high-level KPIs for hierarchy
  const avgGap = overview?.avg_deception_gap || 0;
  const criticalCount = datasetList.filter(d => d.deception_level === 'CRITICAL_DECEPTION').length;
  const validPersonalities = personalityList.filter(p => p.honesty_score != null);
  const sortedPersonalities = [...validPersonalities].sort((a, b) => a.honesty_score! - b.honesty_score!);
  const lowestHonesty = sortedPersonalities[0]?.personality || 'None';
  const lowestScore = sortedPersonalities[0]?.honesty_score || 0;

  return (
    <div className="space-y-8">
      <RevalidateErrorBanner error={revalidateError} onRetry={handleFetchAll} />

      {/* KPI Overview Row - Highest Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Experiments</span>
          <span className="text-3xl font-light text-slate-100 tabular-nums font-mono">{datasetList.length}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Avg Deception Gap</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-light text-indigo-400 tabular-nums font-mono">{avgGap > 0 ? '+' : ''}{avgGap.toFixed(1)}%</span>
          </div>
        </div>
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-rose-500/80 text-xs font-semibold uppercase tracking-wider mb-2">Critical Deviations</span>
          <span className="text-3xl font-light text-rose-400 tabular-nums font-mono">{criticalCount}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Lowest Honesty</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-light text-slate-200 capitalize">{lowestHonesty}</span>
            <span className="text-sm font-medium text-slate-500 tabular-nums font-mono">({lowestScore.toFixed(0)})</span>
          </div>
        </div>
      </div>

      {/* Main Charts - Secondary Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Full-width primary chart */}
        <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 hover:bg-slate-900/40 transition-colors lg:col-span-2">
          <AnalysisChartCard title="Actual vs Reported Progress (Deception Mapping)">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} />
                <XAxis type="number" dataKey="actual_progress" name="Actual" domain={[0, 100]} stroke="#64748b" tick={{fontSize: 11, fill: '#64748b'}} className="tabular-nums font-mono" axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="reported_progress" name="Reported" domain={[0, 100]} stroke="#64748b" tick={{fontSize: 11, fill: '#64748b'}} className="tabular-nums font-mono" axisLine={false} tickLine={false} />
                <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} iconType="circle" />
                <Scatter name="Identity (y=x)" data={[{actual_progress: 0, reported_progress: 0}, {actual_progress: 100, reported_progress: 100}]} fill="none" line={{ stroke: '#475569', strokeDasharray: '4 4' }} />
                {strategies.map((strategy, i) => (
                  <Scatter
                    key={strategy}
                    name={strategy}
                    data={scatterData.filter(d => d.behavior_strategy === strategy)}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>

        <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 hover:bg-slate-900/40 transition-colors">
          <AnalysisChartCard title="Performance by Personality">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personalityList} margin={{ top: 20, right: 20, bottom: 40, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="personality" stroke="#64748b" tick={{fontSize: 11, fill: '#64748b'}} angle={-45} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{fontSize: 11, fill: '#64748b'}} className="tabular-nums font-mono" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f1115', border: '1px solid #334155', color: '#f8fafc', borderRadius: '0.75rem', fontSize: '12px' }} cursor={{fill: '#334155', opacity: 0.2}} />
                <Bar dataKey="performance_score" name="Performance Score" radius={[4, 4, 0, 0]}>
                  {personalityList.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>

        <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 hover:bg-slate-900/40 transition-colors">
          <AnalysisChartCard title="Honesty by Personality">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personalityList} margin={{ top: 20, right: 20, bottom: 40, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="personality" stroke="#64748b" tick={{fontSize: 11, fill: '#64748b'}} angle={-45} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{fontSize: 11, fill: '#64748b'}} className="tabular-nums font-mono" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f1115', border: '1px solid #334155', color: '#f8fafc', borderRadius: '0.75rem', fontSize: '12px' }} cursor={{fill: '#334155', opacity: 0.2}} />
                <Bar dataKey="honesty_score" name="Honesty Score" radius={[4, 4, 0, 0]}>
                  {personalityList.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>

        <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 hover:bg-slate-900/40 transition-colors lg:col-span-2">
          <AnalysisChartCard title="Deception Gap Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bins} margin={{ top: 20, right: 20, bottom: 40, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="binMid" stroke="#64748b" tick={{fontSize: 11, fill: '#64748b'}} tickFormatter={(v) => v.toFixed(0)} name="Deception Gap" className="tabular-nums font-mono" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" allowDecimals={false} tick={{fontSize: 11, fill: '#64748b'}} className="tabular-nums font-mono" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1115', border: '1px solid #334155', color: '#f8fafc', borderRadius: '0.75rem', fontSize: '12px' }}
                  cursor={{fill: '#334155', opacity: 0.2}}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.binStr || label}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} iconType="circle" />
                {strategies.map((strategy, i) => (
                  <Bar key={strategy} dataKey={strategy} stackId="a" fill={COLORS[i % COLORS.length]} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>
      </div>
    </div>
  );
});

export default BehaviourAnalysis;
