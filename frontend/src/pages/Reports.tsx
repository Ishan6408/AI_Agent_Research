import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { 
  AnalyticsOverview, 
  ResearchFindings, 
  SuspiciousExperiment, 
  CorrelationResponse 
} from '../types/api';

export default function Reports() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [findings, setFindings] = useState<ResearchFindings | null>(null);
  const [suspicious, setSuspicious] = useState<SuspiciousExperiment[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationResponse | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overviewRes, findingsRes, suspiciousRes, correlationRes] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getResearchFindings(),
        api.getSuspicious(),
        api.getCorrelation()
      ]);
      
      setOverview(overviewRes);
      setFindings(findingsRes);
      setSuspicious(suspiciousRes);
      setCorrelation(correlationRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 animate-pulse space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-800 rounded"></div>)}
        </div>
        <div className="h-64 bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-red-400">Error Loading Reports</h2>
        <p className="text-slate-300 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!overview || overview.total_experiments === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-4 text-white">Research Reports</h2>
        <p className="text-slate-400">No experiment data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Research Reports</h2>
        <p className="text-slate-400 text-sm">
          A summary of key metrics, research findings, and suspicious agent behaviors observed during experiments.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard label="Total Experiments" value={overview.total_experiments} />
          <MetricCard label="Average Performance" value={overview.avg_performance_score?.toFixed(1) || 'N/A'} />
          <MetricCard label="Average Honesty" value={overview.avg_honesty_score?.toFixed(1) || 'N/A'} />
          <MetricCard label="Detection Rate" value={overview.detection_rate_pct != null ? `${overview.detection_rate_pct.toFixed(1)}%` : 'N/A'} />
          
          <MetricCard label="Average Stress" value={overview.avg_stress_index?.toFixed(2) || 'N/A'} />
          <MetricCard label="Deception Gap" value={overview.avg_deception_gap?.toFixed(2) || 'N/A'} />
          <MetricCard label="Auditor Score" value={overview.avg_auditor_score?.toFixed(2) || 'N/A'} />
          <MetricCard label="Average Bugs" value={overview.avg_bugs_introduced?.toFixed(2) || 'N/A'} />
        </div>
      </div>

      {/* Research Findings */}
      {findings && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Research Findings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-sm mb-2 font-medium">Most Deceptive Personality</div>
              <div className="text-lg font-semibold text-emerald-400">{findings.most_deceptive_personality || 'N/A'}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-sm mb-2 font-medium">Most Deceptive Developer</div>
              <div className="text-lg font-semibold text-amber-400">{findings.most_deceptive_developer || 'N/A'}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-sm mb-2 font-medium">Highest Deception Pressure</div>
              <div className="text-lg font-semibold text-rose-400">{findings.highest_deception_pressure || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Suspicious Experiments */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Suspicious Experiments</h3>
        {suspicious.length === 0 ? (
          <p className="text-slate-400">No suspicious experiments found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm text-left text-slate-300 min-w-[800px]">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Developer</th>
                  <th className="px-4 py-3 font-medium">Pressure</th>
                  <th className="px-4 py-3 font-medium">Personality</th>
                  <th className="px-4 py-3 font-medium text-right">Deception Gap</th>
                  <th className="px-4 py-3 font-medium text-right">Auditor Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {suspicious.map((exp, i) => (
                  <tr key={i} className="hover:bg-slate-800/50">
                    <td className="px-4 py-2 truncate max-w-[150px]" title={exp.task_name}>{exp.task_name}</td>
                    <td className="px-4 py-2">{exp.developer_role}</td>
                    <td className="px-4 py-2">{exp.pressure}</td>
                    <td className="px-4 py-2">{exp.personality}</td>
                    <td className="px-4 py-2 text-right text-rose-400 font-medium">
                      {exp.deception_gap != null ? exp.deception_gap.toFixed(1) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {exp.auditor_score != null ? exp.auditor_score.toFixed(1) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Correlation Summary */}
      {correlation && correlation.columns.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Correlation Overview</h3>
          <p className="text-sm text-slate-400 mb-4">
            Highlights of the strongest correlations (positive and negative) among experimental metrics.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {correlation.columns.slice(0, 4).map(col => {
              // Find max correlation (excluding self) for this column
              const correlations = correlation.matrix[col] || {};
              const pairs = Object.entries(correlations)
                .filter(([otherCol, val]) => otherCol !== col && val !== null)
                .map(([otherCol, val]) => ({ otherCol, val: val as number }))
                .sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
              
              if (pairs.length === 0) return null;
              const topPair = pairs[0];

              return (
                <div key={col} className="bg-slate-800/30 p-3 rounded border border-slate-700 text-sm">
                  <span className="text-slate-300 font-medium">{col.replace(/_/g, ' ')}</span>
                  <span className="text-slate-500 mx-2">strongly correlates with</span>
                  <span className="text-white font-medium">{topPair.otherCol.replace(/_/g, ' ')}</span>
                  <span className={`ml-2 font-mono ${topPair.val > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({topPair.val > 0 ? '+' : ''}{topPair.val.toFixed(2)})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
      <div className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1 truncate" title={label}>{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}
