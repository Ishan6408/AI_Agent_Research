import { api } from '../../services/api';
import type { GroupAnalysisRow } from '../../types/api';
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
import { ChartSkeleton, TableSkeleton, BackgroundRefreshBadge, RevalidateErrorBanner } from '../common/Skeleton';

const COLORS = ['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'];

export default function DeveloperAnalysis() {
  const {
    data: developers,
    isLoading: isDevLoading,
    isValidating: isDevValidating,
    error: devError,
    revalidateError: devRevalError,
    lastUpdated: devUpdated,
    refetch: refetchDev,
  } = useApiData<GroupAnalysisRow[]>('analytics/developers', api.getDevelopers);

  const {
    data: pressure,
    isLoading: isPressureLoading,
    isValidating: isPressureValidating,
    error: pressureError,
    revalidateError: pressureRevalError,
    refetch: refetchPressure,
  } = useApiData<GroupAnalysisRow[]>('analytics/pressure', api.getPressure);

  const isLoading = (isDevLoading && !developers) || (isPressureLoading && !pressure);
  const isValidating = isDevValidating || isPressureValidating;
  const blockingError = (!developers && devError) || (!pressure && pressureError);
  const revalidateError = devRevalError || pressureRevalError;

  const handleRefresh = () => {
    refetchDev();
    refetchPressure();
  };

  if (blockingError) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl backdrop-blur-sm">
        <p className="text-red-300 mb-4 font-mono text-sm">{blockingError.message || 'Failed to fetch developer data'}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-900/50 hover:bg-red-800 border border-red-700 text-red-200 rounded transition-all text-xs font-mono uppercase tracking-widest cursor-pointer"
        >
          Reboot Node
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton title="Bugs by Developer Role" height="h-[320px]" />
          <ChartSkeleton title="Code Quality by Developer Role" height="h-[320px]" />
          <ChartSkeleton title="Pressure vs Bugs" height="h-[320px]" />
          <ChartSkeleton title="Average Performance by Developer" height="h-[320px]" />
        </div>
        <TableSkeleton rows={5} columns={6} />
      </div>
    );
  }

  const devList = developers || [];
  const pressureList = pressure || [];

  if (devList.length === 0) {
    return (
      <div className="text-cyan-500/50 p-6 font-mono text-sm uppercase tracking-widest">
        No telemetry vectors available yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top action / status bar */}
      <div className="flex justify-between items-center px-2">
        <BackgroundRefreshBadge
          isValidating={isValidating}
          lastUpdated={devUpdated}
          onRefresh={handleRefresh}
        />
      </div>

      <RevalidateErrorBanner error={revalidateError} onRetry={handleRefresh} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-cyan-900/30 bg-black/20 p-2 rounded-xl backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:border-cyan-700/50 transition-colors">
          <AnalysisChartCard title="Bugs by Developer Role">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={devList} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="developer_role" stroke="#06b6d4" strokeOpacity={0.6} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#06b6d4" strokeOpacity={0.6} className="tabular-nums font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#0891b2', color: '#cffafe' }}
                  cursor={{ fill: '#06b6d4', opacity: 0.05 }}
                  formatter={(val: any) => [`${typeof val === 'number' ? val.toFixed(2) : val}`, 'Bugs Introduced']}
                />
                <Bar dataKey="bugs_introduced" name="Bugs Introduced">
                  {devList.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>

        <div className="border border-cyan-900/30 bg-black/20 p-2 rounded-xl backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:border-cyan-700/50 transition-colors">
          <AnalysisChartCard title="Code Quality by Developer Role">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={devList} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="developer_role" stroke="#06b6d4" strokeOpacity={0.6} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#06b6d4" strokeOpacity={0.6} domain={[0, 100]} className="tabular-nums font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#0891b2', color: '#cffafe' }}
                  cursor={{ fill: '#06b6d4', opacity: 0.05 }}
                  formatter={(val: any) => [`${typeof val === 'number' ? val.toFixed(2) : val}`, 'Code Quality']}
                />
                <Bar dataKey="code_quality" name="Code Quality">
                  {devList.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>

        <div className="border border-cyan-900/30 bg-black/20 p-2 rounded-xl backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:border-cyan-700/50 transition-colors">
          <AnalysisChartCard title="Pressure vs Bugs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pressureList} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="pressure" stroke="#06b6d4" strokeOpacity={0.6} />
                <YAxis stroke="#06b6d4" strokeOpacity={0.6} className="tabular-nums font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#0891b2', color: '#cffafe' }}
                  cursor={{ fill: '#06b6d4', opacity: 0.05 }}
                  formatter={(val: any) => [`${typeof val === 'number' ? val.toFixed(2) : val}`, 'Bugs Introduced']}
                />
                <Bar dataKey="bugs_introduced" name="Bugs Introduced">
                  {pressureList.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>

        <div className="border border-cyan-900/30 bg-black/20 p-2 rounded-xl backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:border-cyan-700/50 transition-colors">
          <AnalysisChartCard title="Average Performance by Developer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={devList} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="developer_role" stroke="#06b6d4" strokeOpacity={0.6} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#06b6d4" strokeOpacity={0.6} domain={[0, 100]} className="tabular-nums font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#0891b2', color: '#cffafe' }}
                  cursor={{ fill: '#06b6d4', opacity: 0.05 }}
                  formatter={(val: any) => [`${typeof val === 'number' ? val.toFixed(2) : val}`, 'Performance Score']}
                />
                <Bar dataKey="performance_score" name="Performance Score">
                  {devList.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>
      </div>

      <div className="bg-black/20 border border-cyan-900/30 rounded-xl p-6 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-x-auto w-full">
        <h3 className="text-sm font-bold tracking-wider mb-6 text-white/80 uppercase">Node Comparison Data</h3>
        <table className="w-full text-left text-sm text-cyan-100/70 font-mono">
          <thead className="text-cyan-500 text-xs border-b border-cyan-900/50">
            <tr>
              <th className="px-4 py-3 font-normal uppercase tracking-widest">Developer Role</th>
              <th className="px-4 py-3 font-normal uppercase tracking-widest text-right">Performance</th>
              <th className="px-4 py-3 font-normal uppercase tracking-widest text-right">Honesty</th>
              <th className="px-4 py-3 font-normal uppercase tracking-widest text-right">Code Quality</th>
              <th className="px-4 py-3 font-normal uppercase tracking-widest text-right">Bugs</th>
              <th className="px-4 py-3 font-normal uppercase tracking-widest text-right">Deception Gap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-900/20">
            {devList.map((dev) => (
              <tr key={String(dev.developer_role)} className="hover:bg-cyan-900/10 transition-colors">
                <td className="px-4 py-4 text-cyan-200">{dev.developer_role}</td>
                <td className="px-4 py-4 text-right tabular-nums font-mono">{dev.performance_score?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-4 text-right tabular-nums font-mono">{dev.honesty_score?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-4 text-right tabular-nums font-mono">{dev.code_quality?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-4 text-right tabular-nums font-mono">{dev.bugs_introduced?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-4 text-right text-cyan-400 tabular-nums font-mono">{dev.deception_gap?.toFixed(2) ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
