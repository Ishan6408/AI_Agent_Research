import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { DatasetRecord, GroupAnalysisRow } from '../../types/api';
import AnalysisChartCard from './AnalysisChartCard';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function BehaviourAnalysis() {
  const [dataset, setDataset] = useState<DatasetRecord[]>([]);
  const [personalityData, setPersonalityData] = useState<GroupAnalysisRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [datasetRes, personalityRes] = await Promise.all([
        api.getDataset(),
        api.getPersonality()
      ]);
      setDataset(datasetRes);
      setPersonalityData(personalityRes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch behaviour data');
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

  if (dataset.length === 0 && personalityData.length === 0) {
    return <div className="text-slate-400 p-4 bg-slate-900 rounded-lg">No experiment data available yet.</div>;
  }

  // Process data for scatter
  const scatterData = dataset.map(d => ({
    actual_progress: d.actual_progress,
    reported_progress: d.reported_progress,
    behavior_strategy: d.behavior_strategy,
    deception_gap: d.deception_gap,
  }));

  // Group by behavior_strategy for colors
  const strategies = Array.from(new Set(dataset.map(d => d.behavior_strategy)));

  // Custom tooltip for scatter
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 p-3 border border-slate-700 rounded shadow-lg text-sm">
          <p className="text-slate-200"><strong>Strategy:</strong> {data.behavior_strategy}</p>
          <p className="text-slate-200"><strong>Actual:</strong> {data.actual_progress?.toFixed(1)}%</p>
          <p className="text-slate-200"><strong>Reported:</strong> {data.reported_progress?.toFixed(1)}%</p>
          <p className="text-slate-200"><strong>Gap:</strong> {data.deception_gap?.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Histogram logic for Deception Gap
  // Since recharts doesn't have histogram, we bin the data manually.
  const numBins = 20;
  const gaps = dataset.map(d => d.deception_gap).filter(g => g !== undefined && g !== null) as number[];
  const minGap = Math.min(...gaps, 0);
  const maxGap = Math.max(...gaps, 100);
  const binSize = (maxGap - minGap) / numBins;
  
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

  dataset.forEach(d => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AnalysisChartCard title="Actual vs Reported Progress">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" dataKey="actual_progress" name="Actual Progress" domain={[0, 100]} stroke="#94a3b8" />
            <YAxis type="number" dataKey="reported_progress" name="Reported Progress" domain={[0, 100]} stroke="#94a3b8" />
            <Tooltip content={<CustomScatterTooltip />} />
            <Legend />
            {/* Identity line using scatter or reference line approximation */}
            <Scatter name="Identity (y=x)" data={[{actual_progress: 0, reported_progress: 0}, {actual_progress: 100, reported_progress: 100}]} fill="none" line={{ stroke: '#64748b', strokeDasharray: '5 5' }} />
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

      <AnalysisChartCard title="Performance by Personality">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={personalityData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="personality" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
            <Bar dataKey="performance_score" name="Performance Score">
              {personalityData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AnalysisChartCard>

      <AnalysisChartCard title="Honesty by Personality">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={personalityData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="personality" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
            <Bar dataKey="honesty_score" name="Honesty Score">
              {personalityData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AnalysisChartCard>

      <AnalysisChartCard title="Deception Gap Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="binMid" stroke="#94a3b8" tickFormatter={(v) => v.toFixed(0)} name="Deception Gap" />
            <YAxis stroke="#94a3b8" allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.binStr || label}
            />
            <Legend />
            {strategies.map((strategy, i) => (
              <Bar key={strategy} dataKey={strategy} stackId="a" fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </AnalysisChartCard>
    </div>
  );
}
