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

  const PIE_COLORS = ['var(--chart-1)', 'var(--chart-2)'];

  const tooltipStyle = {
    backgroundColor: 'var(--popover)',
    borderColor: 'var(--border)',
    color: 'var(--popover-foreground)',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
  };

  const axisStyle = {
    stroke: 'var(--muted-foreground)',
    fontSize: 12
  };

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border p-4 rounded-lg shadow-lg text-sm text-popover-foreground">
          <p className="font-semibold mb-2 border-b border-border pb-1">Point Details</p>
          <div className="space-y-1">
            <p><span className="text-muted-foreground mr-2">Stress Index:</span>{data.stress_index}</p>
            <p><span className="text-muted-foreground mr-2">Deception Gap:</span>{data.deception_gap}</p>
            {data.pressure && <p><span className="text-muted-foreground mr-2">Pressure:</span>{data.pressure}</p>}
            {data.personality && <p><span className="text-muted-foreground mr-2">Personality:</span>{data.personality}</p>}
            {data.developer_role && <p><span className="text-muted-foreground mr-2">Role:</span>{data.developer_role}</p>}
            {data.performance_score != null && <p><span className="text-muted-foreground mr-2">Performance:</span>{data.performance_score.toFixed(1)}</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Stress vs Deception Gap">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="stress_index" type="number" name="Stress Index" stroke={axisStyle.stroke} tick={{ fontSize: axisStyle.fontSize }} />
            <YAxis dataKey="deception_gap" type="number" name="Deception Gap" stroke={axisStyle.stroke} tick={{ fontSize: axisStyle.fontSize }} />
            <RechartsTooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={scatterData} fill="var(--chart-1)" />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Pressure Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pressureData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" stroke={axisStyle.stroke} tick={{ fontSize: axisStyle.fontSize }} />
            <YAxis stroke={axisStyle.stroke} tick={{ fontSize: axisStyle.fontSize }} />
            <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />
            <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Behaviour Strategy Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={behaviorData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" stroke={axisStyle.stroke} tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
            <YAxis stroke={axisStyle.stroke} tick={{ fontSize: axisStyle.fontSize }} />
            <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />
            <Bar dataKey="value" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
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
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
            >
              {detectionData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '14px', color: 'var(--foreground)' }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
