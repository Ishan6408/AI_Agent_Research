import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { OperationIdempotencyKey } from '../services/idempotency';
import type { Experiment } from '../types/api';
import { Play, Settings, Beaker, CheckCircle, AlertTriangle, RefreshCw, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { useApiData } from '../hooks/useApiData';
import { apiCache } from '../services/cache';
import { TableSkeleton, BackgroundRefreshBadge, RevalidateErrorBanner } from '../components/common/Skeleton';

export default function Experiments() {
  const {
    data: experimentsData,
    isLoading: isInitialLoading,
    isValidating,
    error: listError,
    revalidateError,
    lastUpdated,
    refetch,
  } = useApiData<Experiment[]>('experiments/list', async () => {
    const data = await api.getExperiments();
    return data.reverse();
  });

  const experiments = experimentsData || [];

  // Pagination & Filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPressure, setFilterPressure] = useState('ALL');

  // Execution states
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [runSuccess, setRunSuccess] = useState<React.ReactNode | null>(null);

  // Idempotency key managers — one per logical operation.
  // Using useState lazy initializers so they instantiate exactly once on mount.
  const [singleKey] = useState(() => new OperationIdempotencyKey());
  const [pressureKey] = useState(() => new OperationIdempotencyKey());
  const [allKey] = useState(() => new OperationIdempotencyKey());

  // Form states
  const [singlePressure, setSinglePressure] = useState('LOW');
  const [pressureLevel, setPressureLevel] = useState('LOW');
  const [pressureRuns, setPressureRuns] = useState(10);
  const [allRuns, setAllRuns] = useState(10);

  const handleRunSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (runningAction) return;
    setRunningAction('single');
    setRunError(null);
    setRunSuccess(null);
    const key = singleKey.getOrCreate();
    try {
      const res = await api.runExperiment({ pressure: singlePressure }, key);
      singleKey.clear(); // success → next click is a new submission
      setRunSuccess(
        <span className="flex items-center gap-2">
          Protocol initialized. ID: <strong>{res.experiment_id}</strong>.{' '}
          <Link to={`/experiments/${res.experiment_id}`} className="underline text-brand-primary font-medium hover:text-accent-blue">
            View Logs
          </Link>
        </span>
      );
      apiCache.invalidate(['experiments', 'analytics', 'dataset']);
      refetch();
    } catch (err: any) {
      // Do NOT clear the key on failure so a retry reuses it.
      setRunError(err.message || 'Failed to run single experiment');
    } finally {
      setRunningAction(null);
    }
  };


  const handleRunPressure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (runningAction) return;
    setRunningAction('pressure');
    setRunError(null);
    setRunSuccess(null);
    const key = pressureKey.getOrCreate();
    try {
      const res = await api.runPressureExperiments({ pressure: pressureLevel, runs: pressureRuns }, key);
      pressureKey.clear();
      setRunSuccess(`Batch complete. Executed ${res.count} permutations at ${pressureLevel} threshold.`);
      apiCache.invalidate(['experiments', 'analytics', 'dataset']);
      refetch();
    } catch (err: any) {
      setRunError(err.message || 'Failed to run pressure experiments');
    } finally {
      setRunningAction(null);
    }
  };

  const handleRunAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (runningAction) return;
    if (!window.confirm('WARNING: Initiating full suite execution. Continue?')) return;

    setRunningAction('all');
    setRunError(null);
    setRunSuccess(null);
    const key = allKey.getOrCreate();
    try {
      const res = await api.runAllExperiments({ runs: allRuns }, key);
      allKey.clear();
      setRunSuccess(`Suite complete. Executed full matrix of ${res.count} experiments.`);
      apiCache.invalidate(['experiments', 'analytics', 'dataset']);
      refetch();
    } catch (err: any) {
      setRunError(err.message || 'Failed to run all experiments');
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <div className="flex flex-col min-h-full text-text-main gap-8 max-w-6xl mx-auto w-full pb-12">
      <header className="mb-2">
        <h1 className="font-mono text-3xl font-bold tracking-tight uppercase text-brand-primary mb-2">Experiment Control & Logs</h1>
        <p className="text-text-muted max-w-2xl font-sans">
          Execute new simulation batches or review recent telemetry from the experimental pipeline.
        </p>
      </header>

      {/* Control Terminal Section */}
      <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden shrink-0">
        <div className="bg-surface-alt border-b border-border px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-brand-primary font-mono text-sm uppercase tracking-widest font-bold">
            <Settings size={16} className="text-text-muted" />
            Execution Parameters
          </div>
          <span className="text-xs text-text-muted font-medium bg-secondary px-2 py-1 rounded">System Ready</span>
        </div>

        <div className="p-6">
          {runError && (
            <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg flex items-center gap-3 text-accent-red text-sm">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{runError}</span>
            </div>
          )}

          {runSuccess && (
            <div className="mb-6 p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg flex items-center gap-3 text-accent-green text-sm">
              <CheckCircle size={18} className="shrink-0" />
              <div>{runSuccess}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Single Run Form */}
            <div className="p-6 border border-border rounded-xl bg-surface-alt flex flex-col justify-between hover:border-brand-secondary/50 transition-colors shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-12 h-12 bg-accent-blue/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div>
                <h3 className="text-sm font-bold text-brand-primary mb-4 flex items-center gap-2 uppercase tracking-wide font-mono">
                  <Play size={16} className="text-accent-blue" /> Single Permutation
                </h3>
                <form id="single-form" onSubmit={handleRunSingle} className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-widest">Target Environmental Stress</label>
                    <select
                      value={singlePressure}
                      onChange={(e) => {
                        setSinglePressure(e.target.value);
                        singleKey.reset();
                      }}
                      disabled={runningAction !== null}
                      className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none disabled:opacity-50"
                    >
                      <option value="LOW">Low Stress Condition</option>
                      <option value="MEDIUM">Medium Stress Condition</option>
                      <option value="HIGH">High Stress Condition</option>
                      <option value="IMPOSSIBLE">Impossible Condition</option>
                    </select>
                  </div>
                </form>
              </div>
              <button
                type="submit"
                form="single-form"
                disabled={runningAction !== null}
                className="mt-6 w-full bg-surface hover:bg-secondary border border-border text-brand-primary font-bold py-2.5 px-4 text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm relative z-10 cursor-pointer"
              >
                {runningAction === 'single' ? <RefreshCw size={16} className="animate-spin" /> : 'Run Permutation'}
              </button>
            </div>

            {/* Batch Run Form */}
            <div className="p-6 border border-border rounded-xl bg-surface-alt flex flex-col justify-between hover:border-brand-secondary/50 transition-colors shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-12 h-12 bg-brand-secondary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div>
                <h3 className="text-sm font-bold text-brand-primary mb-4 flex items-center gap-2 uppercase tracking-wide font-mono">
                  <Beaker size={16} className="text-brand-secondary" /> Stress Batch
                </h3>
                <form id="batch-form" onSubmit={handleRunPressure} className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-widest">Stress Level</label>
                    <select
                      value={pressureLevel}
                      onChange={(e) => {
                        setPressureLevel(e.target.value);
                        pressureKey.reset();
                      }}
                      disabled={runningAction !== null}
                      className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-secondary/50 outline-none disabled:opacity-50"
                    >
                      <option value="LOW">Low Stress Condition</option>
                      <option value="MEDIUM">Medium Stress Condition</option>
                      <option value="HIGH">High Stress Condition</option>
                      <option value="IMPOSSIBLE">Impossible Condition</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-widest">Sample Count</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={pressureRuns}
                      onChange={(e) => {
                        setPressureRuns(parseInt(e.target.value, 10));
                        pressureKey.reset();
                      }}
                      disabled={runningAction !== null}
                      className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-secondary/50 outline-none disabled:opacity-50 font-mono tabular-nums"
                    />
                  </div>
                </form>
              </div>
              <button
                type="submit"
                form="batch-form"
                disabled={runningAction !== null}
                className="mt-6 w-full bg-brand-secondary hover:bg-brand-secondary/90 text-background font-bold py-2.5 px-4 text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm relative z-10 cursor-pointer"
              >
                {runningAction === 'pressure' ? <RefreshCw size={16} className="animate-spin" /> : 'Start Batch'}
              </button>
            </div>

            {/* Run All */}
            <div className="p-6 border border-border rounded-xl bg-surface-alt flex flex-col justify-between hover:border-accent-red/50 transition-colors shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-12 h-12 bg-accent-red/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div>
                <h3 className="text-sm font-bold text-brand-primary mb-4 flex items-center gap-2 uppercase tracking-wide font-mono">
                  <AlertTriangle size={16} className="text-accent-red" /> Full Matrix
                </h3>
                <form id="matrix-form" onSubmit={handleRunAll} className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-widest">Runs Per Condition</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={allRuns}
                      onChange={(e) => {
                        setAllRuns(parseInt(e.target.value, 10));
                        allKey.reset();
                      }}
                      disabled={runningAction !== null}
                      className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent-red/50 outline-none disabled:opacity-50 font-mono tabular-nums"
                    />
                  </div>
                </form>
              </div>
              <button
                type="submit"
                form="matrix-form"
                disabled={runningAction !== null}
                className="mt-6 w-full bg-accent-red hover:bg-accent-red/90 text-white font-bold py-2.5 px-4 text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm relative z-10 cursor-pointer"
              >
                {runningAction === 'all' ? <RefreshCw size={16} className="animate-spin" /> : 'Execute Matrix'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Telemetry Log Section */}
      {(() => {
        const filteredExperiments = experiments.filter((exp) => {
          if (filterPressure !== 'ALL' && exp.pressure?.toUpperCase() !== filterPressure) {
            return false;
          }
          if (!searchTerm) return true;
          const term = searchTerm.toLowerCase();
          return (
            exp.id?.toLowerCase().includes(term) ||
            exp.task_name?.toLowerCase().includes(term) ||
            exp.developer_role?.toLowerCase().includes(term)
          );
        });

        const totalPages = Math.max(1, Math.ceil(filteredExperiments.length / pageSize));
        const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
        const paginatedExperiments = filteredExperiments.slice(
          (validCurrentPage - 1) * pageSize,
          validCurrentPage * pageSize
        );

        return (
          <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col shrink-0">
            <div className="bg-surface-alt border-b border-border px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
                <FileText size={18} className="text-text-muted" />
                Experimental Log
                <span className="text-xs font-normal text-text-muted ml-1 font-mono">
                  (<span className="tabular-nums font-bold text-brand-primary">{experiments.length.toLocaleString()}</span> records)
                </span>
              </div>

              {/* Controls: Search, Pressure, Page Size, Refresh */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <BackgroundRefreshBadge
                  isValidating={isValidating}
                  lastUpdated={lastUpdated}
                  onRefresh={() => refetch()}
                />

                <div className="relative flex-1 md:flex-initial">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 pr-3 py-1.5 bg-surface border border-border text-xs rounded-md text-text-main focus:outline-none focus:border-brand-primary w-full md:w-44"
                  />
                </div>

                <select
                  value={filterPressure}
                  onChange={(e) => {
                    setFilterPressure(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1.5 bg-surface border border-border text-xs rounded-md text-text-main focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="ALL">All Stress</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="IMPOSSIBLE">Impossible</option>
                </select>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1.5 bg-surface border border-border text-xs rounded-md text-text-main focus:outline-none focus:border-brand-primary cursor-pointer font-mono tabular-nums"
                >
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                  <option value={250}>250 / page</option>
                </select>

                <button
                  onClick={() => refetch()}
                  disabled={isValidating}
                  className="text-xs font-medium text-text-muted hover:text-brand-primary disabled:opacity-50 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border rounded-md cursor-pointer"
                  title="Reload experimental logs"
                >
                  <RefreshCw size={14} className={isValidating ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            <RevalidateErrorBanner error={revalidateError} onRetry={() => refetch()} />

            {isInitialLoading && !experimentsData ? (
              <TableSkeleton rows={8} columns={8} />
            ) : listError && experiments.length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle size={32} className="text-accent-red mx-auto mb-4" />
                <p className="text-accent-red mb-4 text-sm font-mono">{listError.message || 'Failed to load experiments'}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-surface-alt hover:bg-secondary border border-border text-brand-primary rounded-md text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredExperiments.length === 0 ? (
              <div className="p-12 text-center text-text-muted text-sm font-mono">
                {experiments.length === 0
                  ? 'No experiment records found in the database.'
                  : 'No experiment logs match the current search filters.'}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-surface-alt border-b border-border">
                        <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">ID / Task</th>
                        <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Env. Stress</th>
                        <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Node Role</th>
                        <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap text-right">Divergence</th>
                        <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap text-right">Perf.</th>
                        <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap text-right">Truth</th>
                        <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap text-right">Auditor</th>
                        <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedExperiments.map((exp) => (
                        <tr key={exp.id} className="hover:bg-secondary transition-colors group">
                          <td className="p-4">
                            <div className="font-mono text-xs text-brand-primary mb-1">
                              {exp.id?.split('-')[0]}
                            </div>
                            <div className="text-xs text-text-muted truncate max-w-[150px]" title={exp.task_name}>
                              {exp.task_name}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${
                                exp.pressure?.toUpperCase() === 'HIGH'
                                  ? 'bg-accent-red/10 text-accent-red'
                                  : exp.pressure?.toUpperCase() === 'MEDIUM'
                                  ? 'bg-accent-amber/10 text-accent-amber'
                                  : 'bg-accent-green/10 text-accent-green'
                              }`}
                            >
                              {exp.pressure?.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-brand-secondary">{exp.developer_role}</td>
                          <td className="p-4 text-right text-xs font-medium tabular-nums font-mono">
                            {exp.deception_gap > 0 ? (
                              <span className="text-accent-amber">{exp.deception_gap.toFixed(1)}%</span>
                            ) : (
                              <span className="text-text-muted">{exp.deception_gap?.toFixed(1) || 0}%</span>
                            )}
                          </td>
                          <td className="p-4 text-right text-xs text-brand-secondary tabular-nums font-mono">
                            {exp.performance_score.toFixed(2)}
                          </td>
                          <td className="p-4 text-right text-xs text-brand-secondary tabular-nums font-mono">
                            {exp.honesty_score.toFixed(2)}
                          </td>
                          <td className="p-4 text-right">
                            {exp.deception_detected ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-red tabular-nums font-mono">
                                <AlertTriangle size={12} /> {exp.auditor_score.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-xs text-text-muted tabular-nums font-mono">{exp.auditor_score.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <Link
                              to={`/experiments/${exp.id}`}
                              className="text-xs font-medium text-accent-blue hover:underline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <div className="bg-surface-alt border-t border-border px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-xs text-text-muted font-mono">
                    Showing{' '}
                    <span className="font-semibold text-text-main tabular-nums font-mono">
                      {(validCurrentPage - 1) * pageSize + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold text-text-main tabular-nums font-mono">
                      {Math.min(validCurrentPage * pageSize, filteredExperiments.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-text-main tabular-nums font-mono">
                      {filteredExperiments.length.toLocaleString()}
                    </span>{' '}
                    logs
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={validCurrentPage <= 1}
                      className="p-1.5 rounded border border-border bg-surface text-text-muted hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="First page"
                    >
                      <ChevronsLeft size={14} />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={validCurrentPage <= 1}
                      className="p-1.5 rounded border border-border bg-surface text-text-muted hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Previous page"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <span className="text-xs px-3 py-1 text-text-muted">
                      Page <strong className="text-text-main tabular-nums">{validCurrentPage}</strong> of{' '}
                      <strong className="text-text-main tabular-nums">{totalPages}</strong>
                    </span>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={validCurrentPage >= totalPages}
                      className="p-1.5 rounded border border-border bg-surface text-text-muted hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Next page"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={validCurrentPage >= totalPages}
                      className="p-1.5 rounded border border-border bg-surface text-text-muted hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Last page"
                    >
                      <ChevronsRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        );
      })()}
    </div>
  );
}
