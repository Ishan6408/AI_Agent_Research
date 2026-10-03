import { useMemo } from 'react';
import type { AnalyticsOverview, OverviewScatterPoint } from '../../types/api';
import { ChartCard } from './ChartCard';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface OverviewChartsProps {
  overviewData: AnalyticsOverview;
  scatterData: OverviewScatterPoint[];
}

export function OverviewCharts({ overviewData, scatterData }: OverviewChartsProps) {
  const pressureData = useMemo(() => {
    if (!overviewData.pressure_distribution) return [];
    return Object.entries(overviewData.pressure_distribution).map(([name, value]) => ({ name, value }));
  }, [overviewData.pressure_distribution]);

  const behaviorData = useMemo(() => {
    if (!overviewData.behavior_strategy_distribution) return [];
    return Object.entries(overviewData.behavior_strategy_distribution).map(([name, value]) => ({ name, value }));
  }, [overviewData.behavior_strategy_distribution]);

  const detectionData = useMemo(() => {
    const total = overviewData.total_experiments || 0;
    const rate = overviewData.detection_rate_pct || 0;
    const detectedCount = Math.round((total * rate) / 100);
    const notDetectedCount = total - detectedCount;
    return [
      { name: 'Detected', value: detectedCount },
      { name: 'Not Detected', value: notDetectedCount }
    ];
  }, [overviewData.total_experiments, overviewData.detection_rate_pct]);

  const PIE_COLORS = ['#f43f5e', '#14b8a6'];

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-lg text-sm text-slate-200">
          <p className="font-semibold mb-1">Point Details</p>
          <p>Stress Index: {data.stress_index}</p>
          <p>Deception Gap: {data.deception_gap}</p>
          {data.pressure && <p>Pressure: {data.pressure}</p>}
          {data.personality && <p>Personality: {data.personality}</p>}
          {data.developer_role && <p>Role: {data.developer_role}</p>}
          {data.performance_score != null && <p>Performance: {data.performance_score.toFixed(1)}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Stress vs Deception Gap">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="stress_index" type="number" name="Stress Index" stroke="#94a3b8" />
            <YAxis dataKey="deception_gap" type="number" name="Deception Gap" stroke="#94a3b8" />
            <RechartsTooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={scatterData} fill="#6366f1" />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Pressure Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pressureData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
            <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Behaviour Strategy Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={behaviorData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
            <YAxis stroke="#94a3b8" />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Deception Detection Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={detectionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {detectionData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
            <Legend wrapperStyle={{ fontSize: '14px', color: '#cbd5e1' }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
