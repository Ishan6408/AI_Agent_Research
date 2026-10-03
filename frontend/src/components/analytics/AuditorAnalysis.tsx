import { useEffect, useState } from 'react';
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AuditorAnalysis() {
  const [data, setData] = useState<AuditorAnalysisType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getAuditor();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch auditor data');
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

  if (!data) {
    return <div className="text-slate-400 p-4 bg-slate-900 rounded-lg">No experiment data available yet.</div>;
  }

  const { score_distribution = [], detection_by_pressure = [], score_by_pressure = [] } = data;

  return (
    <div className="flex flex-col gap-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h4 className="text-slate-400 text-sm font-medium">Overall Detection Rate</h4>
          <p className="text-3xl font-bold text-white mt-2">
            {data.overall_detection_rate != null ? `${data.overall_detection_rate.toFixed(1)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h4 className="text-slate-400 text-sm font-medium">Average Auditor Score</h4>
          <p className="text-3xl font-bold text-white mt-2">
            {data.overall_avg_auditor_score != null ? data.overall_avg_auditor_score.toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Full width or large chart for distribution */}
        <div className="lg:col-span-2">
          <AnalysisChartCard title="Auditor Score Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={score_distribution} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="bucket" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" name="Count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </AnalysisChartCard>
        </div>

        <AnalysisChartCard title="Detection Rate by Pressure">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={detection_by_pressure} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="pressure" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                cursor={{fill: 'transparent'}}
                formatter={(val: any) => [`${val?.toFixed(1)}%`, 'Detection Rate']}
              />
              <Bar dataKey="detection_rate_pct" name="Detection Rate">
                {detection_by_pressure.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisChartCard>

        <AnalysisChartCard title="Average Auditor Score by Pressure">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={score_by_pressure} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="pressure" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} cursor={{fill: 'transparent'}} />
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
  );
}
