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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
        <div className="bg-slate-900 rounded-lg h-[400px]"></div>
        <div className="bg-slate-900 rounded-lg h-[400px]"></div>
        <div className="bg-slate-900 rounded-lg h-[400px]"></div>
        <div className="bg-slate-900 rounded-lg h-[400px]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
        <p className="text-red-200 mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Retry</button>
      </div>
    );
  }

  if (developers.length === 0) {
    return <div className="text-slate-400 p-4 bg-slate-900 rounded-lg">No experiment data available yet.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnalysisChartCard title="Bugs by Developer Role">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={developers} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="developer_role" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} cursor={{fill: 'transparent'}} />
              <Bar dataKey="bugs_introduced" name="Bugs Introduced">
                {developers.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisChartCard>

        <AnalysisChartCard title="Code Quality by Developer Role">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={developers} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="developer_role" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} cursor={{fill: 'transparent'}} />
              <Bar dataKey="code_quality" name="Code Quality">
                {developers.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisChartCard>

        <AnalysisChartCard title="Pressure vs Bugs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pressure} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="pressure" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} cursor={{fill: 'transparent'}} />
              <Bar dataKey="bugs_introduced" name="Bugs Introduced">
                {pressure.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisChartCard>

        <AnalysisChartCard title="Average Performance by Developer">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={developers} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="developer_role" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} cursor={{fill: 'transparent'}} />
              <Bar dataKey="performance_score" name="Performance Score">
                {developers.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisChartCard>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-4 overflow-x-auto w-full">
        <h3 className="text-lg font-semibold mb-4 text-white">Developer Comparison</h3>
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium rounded-tl-lg">Developer Role</th>
              <th className="px-4 py-3 font-medium text-right">Performance Score</th>
              <th className="px-4 py-3 font-medium text-right">Honesty Score</th>
              <th className="px-4 py-3 font-medium text-right">Code Quality</th>
              <th className="px-4 py-3 font-medium text-right">Bugs Introduced</th>
              <th className="px-4 py-3 font-medium rounded-tr-lg text-right">Deception Gap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {developers.map((dev) => (
              <tr key={String(dev.developer_role)} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium">{dev.developer_role}</td>
                <td className="px-4 py-3 text-right">{dev.performance_score?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-3 text-right">{dev.honesty_score?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-3 text-right">{dev.code_quality?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-3 text-right">{dev.bugs_introduced?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-4 py-3 text-right">{dev.deception_gap?.toFixed(2) ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
