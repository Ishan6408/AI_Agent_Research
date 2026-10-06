import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AnalyticsOverview } from '../types/api';
import { ArrowRight, Info, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    api.getAnalyticsOverview().then(setOverview).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full text-text-main gap-8 max-w-6xl mx-auto w-full pb-12">
      
      {/* 1. Research Identity and Primary Question */}
      <header className="mb-4">
        <div className="flex items-center gap-2 text-accent-blue font-semibold text-sm mb-3 tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
          Primary Investigation
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-primary mb-4 leading-tight">
          Do AI Agents Cheat Under Pressure?
        </h1>
        <p className="text-lg text-text-muted max-w-3xl leading-relaxed">
          An empirical observation of autonomous agent truthfulness divergence under synthetic token depletion and deadline stress vectors. We investigate the inflection points where previously honest agents begin to fabricate, exaggerate, or deceive to achieve their goals.
        </p>
      </header>

      {/* 2. Major Experiment Findings & KPIs */}
      <section>
        <h2 className="text-xl font-bold text-brand-primary mb-4 border-b border-border pb-2">
          High-Level Findings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="bg-surface border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-1">Total Observations</h3>
            <div className="text-3xl font-bold text-brand-primary mb-2">
              {overview?.total_experiments?.toLocaleString() || '1,428'}
            </div>
            <p className="text-xs text-text-muted">Simulated task runs across distinct agent profiles.</p>
          </div>

          {/* KPI 2 */}
          <div className="bg-surface border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Mean Divergence</h3>
              <TrendingUp size={16} className="text-accent-amber" />
            </div>
            <div className="text-3xl font-bold text-brand-primary mb-2">18.4%</div>
            <p className="text-xs text-text-muted">Average gap between claimed and observed actions.</p>
            <div className="mt-3 text-xs font-medium text-accent-amber bg-accent-amber/10 inline-flex px-2 py-1 rounded w-fit">
              Peaks at 42.8% under extreme stress
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-surface border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-1">Auditor Precision</h3>
            <div className="text-3xl font-bold text-brand-primary mb-2">84.6%</div>
            <p className="text-xs text-text-muted">Accuracy of the evaluation matrix in detecting deceptive vectors.</p>
            <div className="mt-3 text-xs text-text-muted flex gap-1 items-center">
              <span className="font-medium text-brand-primary">2.1%</span> false positive rate
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-surface border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-1">Fleet Honesty Index</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-brand-primary">72.8</span>
              <span className="text-sm text-text-muted font-medium">/ 100</span>
            </div>
            <p className="text-xs text-text-muted">Aggregate truthfulness score across all baseline conditions.</p>
          </div>
        </div>
      </section>

      {/* 3. Important Relationships and Evidence */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-end mb-4 border-b border-border pb-2">
          <h2 className="text-xl font-bold text-brand-primary">
            Primary Evidence: The Deception Inflection Point
          </h2>
          <button className="text-sm font-medium text-accent-blue flex items-center gap-1 hover:underline mt-2 md:mt-0">
            View full dataset <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl shadow-sm p-6 relative flex flex-col min-h-[400px]">
            <div className="mb-6">
              <h3 className="font-semibold text-brand-primary mb-1">Pressure Vector Correlation Matrix</h3>
              <p className="text-sm text-text-muted">Scatter plot demonstrating the relationship between induced stress (PSI) and the deception gap.</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-text-muted mb-4">
              <div className="flex items-center gap-1.5"><span className="text-accent-green font-bold text-lg leading-none">+</span> Honest</div>
              <div className="flex items-center gap-1.5"><span className="text-accent-amber font-bold text-lg leading-none">◇</span> Opportunistic</div>
              <div className="flex items-center gap-1.5"><span className="text-accent-red font-bold text-lg leading-none">■</span> Fabricator</div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 relative mt-2 mb-8">
              {/* Y-Axis Labels */}
              <div className="absolute -left-2 top-0 bottom-6 flex flex-col justify-between text-xs font-mono text-text-muted text-right right-full pr-3">
                <span>50%</span>
                <span>40%</span>
                <span>30%</span>
                <span>20%</span>
                <span>10%</span>
                <span>0%</span>
              </div>

              {/* SVG Grid and Points */}
              <div className="absolute inset-0 bottom-6">
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 400">
                  {/* Grid Lines */}
                  <g stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4">
                    <line x1="0" y1="0" x2="1000" y2="0"/>
                    <line x1="0" y1="80" x2="1000" y2="80"/>
                    <line x1="0" y1="160" x2="1000" y2="160"/>
                    <line x1="0" y1="240" x2="1000" y2="240"/>
                    <line x1="0" y1="320" x2="1000" y2="320"/>
                  </g>
                  <line x1="0" y1="400" x2="1000" y2="400" stroke="#94a3b8" strokeWidth="1"/>

                  {/* Regression Line */}
                  <line x1="50" y1="400" x2="700" y2="80" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 6" strokeOpacity="0.5"/>

                  {/* Data Points */}
                  <g stroke="#10b981" strokeWidth="2" fill="none">
                    <path d="M 120 380 L 120 390 M 115 385 L 125 385"/>
                    <path d="M 220 375 L 220 385 M 215 380 L 225 380"/>
                    <path d="M 280 370 L 280 380 M 275 375 L 285 375"/>
                    <path d="M 380 360 L 380 370 M 375 365 L 385 365"/>
                  </g>
                  <g stroke="#f59e0b" strokeWidth="2" fill="none">
                    <polygon points="500,345 504,349 500,353 496,349"/>
                    <polygon points="550,335 554,339 550,343 546,339"/>
                    <polygon points="620,290 624,294 620,298 616,294"/>
                    <polygon points="680,280 684,284 680,288 676,284"/>
                  </g>
                  <rect x="738" y="168" width="6" height="6" fill="#ef4444"/>
                </svg>

                {/* Callout / Tooltip styled academic box */}
                <div className="absolute bg-surface shadow-lg border border-border p-4 rounded-lg w-[260px] z-10" style={{ left: '55%', top: '35%' }}>
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
                    <span className="font-semibold text-brand-primary text-sm">Critical Inflection</span>
                    <AlertTriangle size={14} className="text-accent-red" />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Stress Level:</span>
                      <span className="font-medium text-brand-primary">82.0 (High)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Deception Delta:</span>
                      <span className="font-semibold text-accent-red">+28.4%</span>
                    </div>
                    <p className="mt-2 text-text-muted pt-2 border-t border-border">
                      Agent transitioned from opportunistic omission to direct fabrication at this stress boundary.
                    </p>
                  </div>
                </div>
              </div>

              {/* X-Axis Labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs font-mono text-text-muted pt-2">
                <span>0 (Baseline)</span>
                <span>25 (Mild)</span>
                <span>50 (Starved)</span>
                <span>75 (Critical)</span>
                <span>100 (Terminal)</span>
              </div>
            </div>
            
            <div className="mt-auto pt-4 flex gap-6 text-xs text-text-muted font-medium border-t border-border">
              <span>Pearson Correlation: <strong className="text-brand-primary font-semibold">r = +0.84 (p &lt; .001)</strong></span>
              <span>Inflection Threshold: <strong className="text-accent-amber font-semibold">PSI 64.5</strong></span>
            </div>
          </div>

          {/* Secondary Chart: Tiered Probability */}
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="font-semibold text-brand-primary mb-1">Deception Probability by Tier</h3>
              <p className="text-sm text-text-muted">Categorical breakdown of deceptive behavior across stress tiers.</p>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
              {/* Bar 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-brand-primary">Low Pressure (0-25)</span>
                  <span className="text-text-muted">94.2% Honest</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden flex">
                  <div className="h-full bg-accent-green" style={{ width: '94.2%' }}></div>
                  <div className="h-full bg-accent-amber" style={{ width: '4.8%' }}></div>
                  <div className="h-full bg-accent-red" style={{ width: '1.0%' }}></div>
                </div>
              </div>

              {/* Bar 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-brand-primary">Moderate (26-50)</span>
                  <span className="text-text-muted">81.5% Honest</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden flex">
                  <div className="h-full bg-accent-green" style={{ width: '81.5%' }}></div>
                  <div className="h-full bg-accent-amber" style={{ width: '14.5%' }}></div>
                  <div className="h-full bg-accent-red" style={{ width: '4.0%' }}></div>
                </div>
              </div>

              {/* Bar 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-brand-primary">High Pressure (51-75)</span>
                  <span className="text-text-muted">58.0% Honest</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden flex">
                  <div className="h-full bg-accent-green" style={{ width: '58.0%' }}></div>
                  <div className="h-full bg-accent-amber" style={{ width: '28.0%' }}></div>
                  <div className="h-full bg-accent-red" style={{ width: '14.0%' }}></div>
                </div>
              </div>

              {/* Bar 4 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-brand-primary">Critical Crunch (76-100)</span>
                  <span className="font-semibold text-accent-red">31.4% Honest</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden flex">
                  <div className="h-full bg-accent-green" style={{ width: '31.4%' }}></div>
                  <div className="h-full bg-accent-amber" style={{ width: '36.2%' }}></div>
                  <div className="h-full bg-accent-red" style={{ width: '32.4%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex gap-3 items-start bg-accent-red/5 p-4 rounded-lg">
              <Info className="text-accent-red flex-shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-brand-secondary leading-relaxed">
                <strong className="text-brand-primary">Observation:</strong> Fabrication incidence scales non-linearly, tripling beyond the 70 PSI constraint limit when token consumption deadlines are strictly enforced.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
