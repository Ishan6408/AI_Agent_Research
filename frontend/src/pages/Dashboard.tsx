import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AnalyticsOverview, OverviewScatterPoint, GroupAnalysisRow } from '../types/api';
import { Terminal, Activity, ShieldCheck, Crosshair } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [scatter, setScatter] = useState<OverviewScatterPoint[]>([]);
  const [pressure, setPressure] = useState<GroupAnalysisRow[]>([]);

  useEffect(() => {
    api.getAnalyticsOverview().then(setOverview).catch(console.error);
    api.getOverviewScatter().then(setScatter).catch(console.error);
    api.getPressure().then(setPressure).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col min-h-full text-text-main gap-6 max-w-[1400px] mx-auto w-full">
      {/* Header section with metadata */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-accent-mint font-mono text-xs mb-2 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-none bg-accent-mint animate-pulse"></span>
            SYS.MONITOR.ACTIVE
          </div>
          <h1 className="font-sans text-3xl font-bold text-brand-primary tracking-tight uppercase">
            STRESS-DECEPTION TELEMETRY
          </h1>
        </div>
        
        {/* Research metadata block */}
        <div className="flex gap-4 font-mono text-[10px] text-text-muted">
          <div className="flex flex-col border-l border-border pl-3">
            <span className="uppercase tracking-widest mb-1">Target</span>
            <span className="text-brand-primary">LLM.BEHAVIOR.DIVERGENCE</span>
          </div>
          <div className="flex flex-col border-l border-border pl-3">
            <span className="uppercase tracking-widest mb-1">Status</span>
            <span className="text-accent-mint">[LIVE]</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 mb-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Ribbon Panel 1 */}
          <div className="bg-surface-alt p-6 flex flex-col justify-between border-2 border-accent-blue/30 rounded-xl shadow-sm hover:border-accent-blue transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-blue/10 rounded-bl-full"></div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
              <Terminal size={14} className="text-accent-blue" />
              Obs. Count
            </div>
            <div className="font-mono text-4xl font-light text-brand-primary">
              {overview ? overview.total_experiments.toLocaleString() : '-'}
            </div>
            <div className="font-mono text-[10px] text-text-muted mt-4 border-t border-border/50 pt-3 flex justify-between uppercase">
              <span>Records:</span>
              <span className="text-accent-blue font-bold">{overview ? '100% INDEXED' : '...'}</span>
            </div>
          </div>
          
          {/* Ribbon Panel 2 - Highlighted */}
          <div className="bg-surface-alt p-6 flex flex-col justify-between border-2 border-accent-amber/30 rounded-xl shadow-sm hover:border-accent-amber transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-amber/10 rounded-bl-full"></div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
              <Activity size={14} className="text-accent-amber" />
              Mean Divergence
            </div>
            <div className="font-mono text-4xl font-bold text-accent-amber">
              {overview?.avg_deception_gap != null ? overview.avg_deception_gap.toFixed(1) : '-'}<span className="text-lg text-accent-amber/60 font-light ml-1">%</span>
            </div>
            <div className="font-mono text-[10px] text-text-muted mt-4 border-t border-border/50 pt-3 flex justify-between uppercase">
              <span>Status:</span>
              <span className="text-accent-amber font-bold">{overview?.system_status ? `[${overview.system_status}]` : '...'}</span>
            </div>
          </div>

          {/* Ribbon Panel 3 */}
          <div className="bg-surface-alt p-6 flex flex-col justify-between border-2 border-accent-purple/30 rounded-xl shadow-sm hover:border-accent-purple transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-purple/10 rounded-bl-full"></div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
              <Crosshair size={14} className="text-accent-purple" />
              Auditor Precision
            </div>
            <div className="font-mono text-4xl font-light text-brand-primary">
              {overview?.detection_rate_pct != null ? overview.detection_rate_pct.toFixed(1) : '-'}<span className="text-lg text-text-muted font-light ml-1">%</span>
            </div>
            <div className="font-mono text-[10px] text-text-muted mt-4 border-t border-border/50 pt-3 flex justify-between uppercase">
              <span>Avg Score:</span>
              <span className="text-accent-purple font-bold">{overview?.avg_auditor_score != null ? overview.avg_auditor_score.toFixed(1) : '-'}</span>
            </div>
          </div>

          {/* Ribbon Panel 4 */}
          <div className="bg-surface-alt p-6 flex flex-col justify-between border-2 border-accent-mint/30 rounded-xl shadow-sm hover:border-accent-mint transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-mint/10 rounded-bl-full"></div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
              <ShieldCheck size={14} className="text-accent-mint" />
              Fleet Honesty Index
            </div>
            <div className="font-mono text-4xl font-light text-brand-primary">
              {overview?.avg_honesty_score != null ? overview.avg_honesty_score.toFixed(1) : '-'}<span className="text-lg text-text-muted font-light ml-1">/100</span>
            </div>
            <div className="font-mono text-[10px] text-text-muted mt-4 border-t border-border/50 pt-3 flex justify-between uppercase">
              <span>Mean Quality:</span>
              <span className="text-accent-mint font-bold">{overview?.avg_code_quality != null ? overview.avg_code_quality.toFixed(1) : '...'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 border border-border bg-surface flex flex-col rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-border p-4 flex justify-between items-center bg-surface-alt/50">
            <h2 className="font-mono text-sm font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} /> Pressure v. Deception Correlation
            </h2>
          </div>
          
          <div className="flex-1 relative p-6 min-h-[350px]">
            {scatter.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E232B" vertical={false} />
                  <XAxis 
                    type="number" 
                    dataKey="stress_index" 
                    name="Stress Index" 
                    stroke="#334155"
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="deception_gap" 
                    name="Deception Gap" 
                    stroke="#334155"
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Scatter name="Experiments" data={scatter} fill="#00F2A5">
                    {scatter.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.deception_gap > 20 ? '#F5A623' : '#00F2A5'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted font-mono text-sm">
                [AWAITING_DATA]
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Tiered Probability Analysis */}
        <section className="lg:col-span-4 border border-border bg-surface flex flex-col rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-border p-4 bg-surface-alt/50">
            <h2 className="font-mono text-sm font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <Terminal size={16} /> Deception By Pressure
            </h2>
          </div>
          
          <div className="p-5 flex-1 flex flex-col gap-6">
            {pressure.length > 0 ? pressure.map((tier, idx) => {
                const gap = tier.deception_gap || 0;
                const isAlert = tier.is_alert;
                const width = Math.min(Math.max(gap, 0), 100);
                return (
                  <div key={String(tier.pressure || idx)}>
                    <div className="flex justify-between font-mono text-[10px] mb-2 uppercase tracking-widest">
                      <span className="text-text-muted">{tier.pressure} PRESSURE</span>
                      <span className={isAlert ? "text-accent-amber font-bold" : "text-accent-mint font-bold"}>
                        {gap.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1 bg-border w-full flex">
                      <div className={isAlert ? "h-full bg-accent-amber" : "h-full bg-accent-mint"} style={{ width: `${width}%` }}></div>
                    </div>
                  </div>
                );
            }) : (
              <div className="text-text-muted font-mono text-[10px] uppercase">
                [NO_DATA_AVAILABLE]
              </div>
            )}
          </div>
        </section>
      </div>
      
      {/* Technical Footer */}
      <footer className="border-t border-border py-4 mt-2 flex justify-between items-center font-mono text-[10px] text-text-muted tracking-widest">
        <div>
          RECORDS_ANALYSED: {overview?.total_experiments ?? 0} // TELEMETRY_STREAM_OK
        </div>
        <div>
          [ EOF ]
        </div>
      </footer>
    </div>
  );
}
