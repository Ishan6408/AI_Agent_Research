import { useEffect, useState } from 'react';
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

const COLORS = ['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'];

export default function DeveloperAnalysis() {
  const [developers, setDevelopers] = useState<GroupAnalysisRow[]>([]);
  const [pressure, setPressure] = useState<GroupAnalysisRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [devRes, pressureRes] = await Promise.all([
        api.getDevelopers(),
        api.getPressure()
      ]);
      setDevelopers(devRes);
      setPressure(pressureRes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch developer data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse p-4">
        <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl h-[400px]"></div>
        <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl h-[400px]"></div>
        <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl h-[400px]"></div>
        <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl h-[400px]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl backdrop-blur-sm">
        <p className="text-red-300 mb-4 font-mono">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-red-900/50 hover:bg-red-800 border border-red-700 text-red-200 rounded transition-all text-xs font-mono uppercase tracking-widest">Reboot Node</button>
      </div>
    );
  }

  if (developers.length === 0) {
    return <div className="text-cyan-500/50 p-4 font-mono text-sm uppercase tracking-widest">No telemetry vectors available yet.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-cyan-900/30 bg-black/20 p-2 rounded-xl backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:border-cyan-700/50 transition-colors">
          <AnalysisChartCard title="Bugs by Developer Role">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={developers} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="developer_role" stroke="#06b6d4" strokeOpacity={0.6} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#06b6d4" strokeOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#0891b2', color: '#cffafe' }} cursor={{fill: '#06b6d4', opacity: 0.05}} />
                <Bar dataKey="bugs_introduced" name="Bugs Introduced">
                  {developers.map((_, index) => (
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
              <BarChart data={developers} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="developer_role" stroke="#06b6d4" strokeOpacity={0.6} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#06b6d4" strokeOpacity={0.6} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#0891b2', color: '#cffafe' }} cursor={{fill: '#06b6d4', opacity: 0.05}} />
                <Bar dataKey="code_quality" name="Code Quality">
                  {developers.map((_, index) => (
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
              <BarChart data={pressure} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="pressure" stroke="#06b6d4" strokeOpacity={0.6} />
                <YAxis stroke="#06b6d4" strokeOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#0891b2', color: '#cffafe' }} cursor={{fill: '#06b6d4', opacity: 0.05}} />
                <Bar dataKey="bugs_introduced" name="Bugs Introduced">
                  {pressure.map((_, index) => (
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
              <BarChart data={developers} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="developer_role" stroke="#06b6d4" strokeOpacity={0.6} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#06b6d4" strokeOpacity={0.6} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#0891b2', color: '#cffafe' }} cursor={{fill: '#06b6d4', opacity: 0.05}} />
                <Bar dataKey="performance_score" name="Performance Score">
                  {developers.map((_, index) => (
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
            {developers.map((dev) => (
              <tr key={String(dev.developer_role)} className="hover:bg-cyan-900/10 transition-colors">
                <td className="px-4 py-4 text-cyan-200">{dev.developer_role}</td>
                <td className="px-4 py-4 text-right">{dev.performance_score?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-4 text-right">{dev.honesty_score?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-4 text-right">{dev.code_quality?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-4 text-right">{dev.bugs_introduced?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-4 text-right text-cyan-400">{dev.deception_gap?.toFixed(2) ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
