import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AnalyticsOverview, CorrelationResponse, SuspiciousExperiment } from '../types/api';
import { AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';

export default function Reports() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationResponse | null>(null);
  const [findings, setFindings] = useState<any | null>(null);
  const [suspicious, setSuspicious] = useState<SuspiciousExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, correlationData, findingsData, suspiciousData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getCorrelation(),
        api.getResearchFindings(),
        api.getSuspicious()
      ]);
      setOverview(overviewData);
      setCorrelation(correlationData);
      setFindings(findingsData);
      setSuspicious(suspiciousData);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 w-full gap-4">
        <RefreshCw size={24} className="text-text-muted animate-spin" />
        <p className="text-sm text-text-muted">Compiling executive report...</p>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-12 text-center border border-border bg-surface rounded-xl">
        <AlertTriangle size={32} className="text-accent-red mx-auto mb-4" />
        <p className="text-accent-red mb-4 text-sm">{error || 'Failed to initialize report'}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-surface-alt hover:bg-secondary border border-border text-brand-primary rounded-md text-sm transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full text-text-main gap-10 max-w-5xl mx-auto w-full pb-12">
      {/* Header */}
      <header className="border-b border-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-brand-primary mb-3">Executive Summary</h1>
          <p className="text-text-muted text-sm max-w-2xl leading-relaxed">
            A formalized summary of key metrics, behavioral findings, and critical deviations observed during the multi-agent stress simulations.
          </p>
        </div>
        <div className="bg-accent-red/10 border border-accent-red/20 px-3 py-1 rounded text-[10px] font-bold text-accent-red tracking-wider uppercase">
          Confidential
        </div>
      </header>

      {/* Key Metrics */}
      <section>
        <h3 className="text-lg font-serif font-bold text-brand-primary mb-4 pb-2 border-b border-border flex items-center gap-2">
          I. Primary Telemetry
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <MetricCard label="Total Deployments" value={overview.total_experiments} />
          <MetricCard label="Mean Performance" value={overview.avg_performance_score?.toFixed(1) || '[NO_DATA]'} />
          <MetricCard label="Mean Honesty" value={overview.avg_honesty_score?.toFixed(1) || '[NO_DATA]'} />
          <MetricCard label="Detection Rate" value={overview.detection_rate_pct != null ? `${overview.detection_rate_pct.toFixed(1)}%` : '[NO_DATA]'} isAlert={overview.auditor_alert} />
          
          <MetricCard label="Mean Stress Index" value={overview.avg_stress_index?.toFixed(2) || '[NO_DATA]'} />
          <MetricCard label="Aggregate Deception Gap" value={overview.avg_deception_gap?.toFixed(2) || '[NO_DATA]'} />
          <MetricCard label="Auditor Strictness" value={overview.avg_auditor_score?.toFixed(2) || '[NO_DATA]'} />
          <MetricCard label="Mean Bugs Introduced" value={overview.avg_bugs_introduced?.toFixed(2) || '[NO_DATA]'} />
        </div>
      </section>

      {/* Research Findings */}
      {findings && (
        <section>
          <h3 className="text-lg font-serif font-bold text-brand-primary mb-4 pb-2 border-b border-border flex items-center gap-2">
            II. Critical Findings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border p-5 rounded-xl shadow-sm border-l-4 border-l-accent-amber">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Primary Deceptive Vector (Personality)</div>
              <div className="text-xl font-bold text-brand-primary">{findings.most_deceptive_personality || '[NO_DATA]'}</div>
            </div>
            <div className="bg-surface border border-border p-5 rounded-xl shadow-sm border-l-4 border-l-accent-amber">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Primary Deceptive Vector (Role)</div>
              <div className="text-xl font-bold text-brand-primary">{findings.most_deceptive_developer || '[NO_DATA]'}</div>
            </div>
            <div className="bg-surface border border-border p-5 rounded-xl shadow-sm border-l-4 border-l-accent-red">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Max Deception Threshold</div>
              <div className="text-xl font-bold text-brand-primary">{findings.highest_deception_pressure || '[NO_DATA]'}</div>
            </div>
          </div>
        </section>
      )}

      {/* Suspicious Experiments */}
      <section>
        <h3 className="text-lg font-serif font-bold text-brand-primary mb-4 pb-2 border-b border-border flex items-center gap-2">
          III. Flagged Anomalies
          <span className="bg-accent-red/10 text-accent-red text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle size={10} /> Requires Review
          </span>
        </h3>
        
        {suspicious.length === 0 ? (
          <div className="p-6 bg-surface border border-border rounded-xl text-text-muted text-sm italic">
            No anomalous or suspicious deviations detected in the current dataset.
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs font-semibold text-text-muted bg-surface-alt border-b border-border">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Task Designation</th>
                  <th className="px-4 py-3 whitespace-nowrap">Developer Profile</th>
                  <th className="px-4 py-3 whitespace-nowrap">Env. Stress</th>
                  <th className="px-4 py-3 whitespace-nowrap">Personality</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Deception Variance</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Auditor Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {suspicious.map((exp, i) => (
                  <tr key={i} className="hover:bg-secondary transition-colors">
                    <td className="px-4 py-3 text-brand-secondary text-xs truncate max-w-[200px]" title={exp.task_name}>{exp.task_name}</td>
                    <td className="px-4 py-3 text-brand-secondary text-xs">{exp.developer_role}</td>
                    <td className="px-4 py-3 text-brand-secondary text-xs">{exp.pressure}</td>
                    <td className="px-4 py-3 text-brand-secondary text-xs">{exp.personality}</td>
                    <td className="px-4 py-3 text-right font-medium text-accent-red text-xs">
                      {exp.deception_gap != null ? `+${exp.deception_gap.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-brand-secondary text-xs">
                      {exp.auditor_score != null ? exp.auditor_score.toFixed(1) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Correlation Summary */}
      {correlation && correlation.columns && correlation.columns.length > 0 && (
        <section>
          <h3 className="text-lg font-serif font-bold text-brand-primary mb-4 pb-2 border-b border-border flex items-center gap-2">
            IV. Statistical Correlations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {correlation.columns.slice(0, 6).map((col: string) => {
              const correlations = correlation.matrix[col] || {};
              const pairs = Object.entries(correlations)
                .filter(([otherCol, val]) => otherCol !== col && val !== null)
                .map(([otherCol, val]) => ({ otherCol, val: val as number }))
                .sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
              
              if (pairs.length === 0) return null;
              const topPair = pairs[0];

              return (
                <div key={col} className="flex flex-col border-b border-border pb-3">
                  <span className="text-brand-primary font-medium text-base mb-1">{col.replace(/_/g, ' ')}</span>
                  <div className="flex items-center text-sm mt-1">
                    <span className="text-text-muted text-xs mr-3">Primary Correlate:</span>
                    <span className="text-brand-secondary text-xs mr-3 capitalize">{topPair.otherCol.replace(/_/g, ' ')}</span>
                    <span className={`${topPair.val > 0 ? 'text-accent-green' : 'text-accent-red'} font-bold text-xs ml-auto`}>
                      {topPair.val > 0 ? '↑' : '↓'} {Math.abs(topPair.val).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}

function MetricCard({ label, value, isAlert = false }: { label: string; value: React.ReactNode, isAlert?: boolean }) {
  return (
    <div className="flex flex-col bg-surface border border-border p-4 rounded-xl shadow-sm">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{label}</span>
      <span className={`text-2xl font-bold ${isAlert ? 'text-accent-red' : 'text-brand-primary'}`}>{value}</span>
    </div>
  );
}
