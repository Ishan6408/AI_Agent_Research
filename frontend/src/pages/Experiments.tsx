import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Experiment } from '../types/api';
import { Play, Settings, Beaker, CheckCircle, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

export default function Experiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Execution states
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [runSuccess, setRunSuccess] = useState<React.ReactNode | null>(null);

  // Form states
  const [singlePressure, setSinglePressure] = useState('LOW');
  const [pressureLevel, setPressureLevel] = useState('LOW');
  const [pressureRuns, setPressureRuns] = useState(10);
  const [allRuns, setAllRuns] = useState(10);

  const fetchExperiments = async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const data = await api.getExperiments();
      setExperiments(data.reverse());
    } catch (err: any) {
      setListError(err.message || 'Failed to load experiments');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const handleRunSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (runningAction) return;
    setRunningAction('single');
    setRunError(null);
    setRunSuccess(null);
    try {
      const res = await api.runExperiment({ pressure: singlePressure });
      setRunSuccess(
        <span className="flex items-center gap-2">
          Protocol initialized. ID: <strong>{res.experiment_id}</strong>.{' '}
          <Link to={`/experiments/${res.experiment_id}`} className="underline text-brand-primary font-medium hover:text-accent-blue">View Logs</Link>
        </span>
      );
      fetchExperiments();
    } catch (err: any) {
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
    try {
      const res = await api.runPressureExperiments({ pressure: pressureLevel, runs: pressureRuns });
      setRunSuccess(`Batch complete. Executed ${res.count} permutations at ${pressureLevel} threshold.`);
      fetchExperiments();
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
    try {
      const res = await api.runAllExperiments({ runs: allRuns });
      setRunSuccess(`Suite complete. Executed full matrix of ${res.count} experiments.`);
      fetchExperiments();
    } catch (err: any) {
      setRunError(err.message || 'Failed to run all experiments');
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <div className="flex flex-col h-full text-text-main gap-8 max-w-6xl mx-auto w-full pb-12">
      <header className="mb-2">
        <h1 className="font-serif text-3xl font-bold text-brand-primary mb-2">Experiment Control & Logs</h1>
        <p className="text-text-muted max-w-2xl">
          Execute new simulation batches or review recent telemetry from the experimental pipeline.
        </p>
      </header>

      {/* Control Terminal Section */}
      <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="bg-surface-alt border-b border-border px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
            <Settings size={18} className="text-text-muted" />
            Execution Parameters
          </div>
          <span className="text-xs text-text-muted font-medium bg-secondary px-2 py-1 rounded">System Ready</span>
        </div>
        
        <div className="p-6">
          {runError && (
            <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5" />
              <span>{runError}</span>
            </div>
          )}
          
          {runSuccess && (
            <div className="mb-6 p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg text-accent-green text-sm flex items-start gap-3">
              <CheckCircle size={18} className="mt-0.5" />
              <span>{runSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Run Single */}
            <div className="p-5 border border-border rounded-lg bg-surface flex flex-col justify-between hover:border-accent-blue/30 transition-colors">
              <div>
                <h3 className="text-sm font-semibold text-brand-primary mb-4 flex items-center gap-2">
                  <Play size={16} className="text-accent-blue" /> Single Evaluation
                </h3>
                <form id="single-form" onSubmit={handleRunSingle} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Stress Level</label>
                    <select
                      value={singlePressure}
                      onChange={(e) => setSinglePressure(e.target.value)}
                      disabled={runningAction !== null}
                      className="w-full bg-surface-alt border border-border rounded-md p-2 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none disabled:opacity-50"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </form>
              </div>
              <button
                type="submit"
                form="single-form"
                disabled={runningAction !== null}
                className="mt-6 w-full bg-surface-alt hover:bg-secondary border border-border text-brand-primary font-medium py-2 px-4 text-sm rounded-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {runningAction === 'single' ? <RefreshCw size={16} className="animate-spin" /> : 'Run Trace'}
              </button>
            </div>

            {/* Run Pressure */}
            <div className="p-5 border border-border rounded-lg bg-surface flex flex-col justify-between hover:border-accent-blue/30 transition-colors">
              <div>
                <h3 className="text-sm font-semibold text-brand-primary mb-4 flex items-center gap-2">
                  <Beaker size={16} className="text-accent-blue" /> Batch Evaluation
                </h3>
                <form id="batch-form" onSubmit={handleRunPressure} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-1">Stress</label>
                      <select
                        value={pressureLevel}
                        onChange={(e) => setPressureLevel(e.target.value)}
                        disabled={runningAction !== null}
                        className="w-full bg-surface-alt border border-border rounded-md p-2 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none disabled:opacity-50"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-1">Iterations</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={pressureRuns}
                        onChange={(e) => setPressureRuns(parseInt(e.target.value, 10))}
                        disabled={runningAction !== null}
                        className="w-full bg-surface-alt border border-border rounded-md p-2 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                </form>
              </div>
              <button
                type="submit"
                form="batch-form"
                disabled={runningAction !== null}
                className="mt-6 w-full bg-accent-blue hover:bg-accent-blue/90 text-white font-medium py-2 px-4 text-sm rounded-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {runningAction === 'pressure' ? <RefreshCw size={16} className="animate-spin" /> : 'Start Batch'}
              </button>
            </div>

            {/* Run All */}
            <div className="p-5 border border-border rounded-lg bg-surface flex flex-col justify-between hover:border-accent-red/30 transition-colors">
              <div>
                <h3 className="text-sm font-semibold text-brand-primary mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-accent-red" /> Full Matrix
                </h3>
                <form id="matrix-form" onSubmit={handleRunAll} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Runs Per Condition</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={allRuns}
                      onChange={(e) => setAllRuns(parseInt(e.target.value, 10))}
                      disabled={runningAction !== null}
                      className="w-full bg-surface-alt border border-border rounded-md p-2 text-sm focus:ring-2 focus:ring-accent-red/50 outline-none disabled:opacity-50"
                    />
                  </div>
                </form>
              </div>
              <button
                type="submit"
                form="matrix-form"
                disabled={runningAction !== null}
                className="mt-6 w-full bg-surface-alt hover:bg-accent-red/10 border border-border hover:border-accent-red/30 text-accent-red font-medium py-2 px-4 text-sm rounded-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {runningAction === 'all' ? <RefreshCw size={16} className="animate-spin" /> : 'Execute Matrix'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Telemetry Log Section */}
      <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="bg-surface-alt border-b border-border px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
            <FileText size={18} className="text-text-muted" />
            Experimental Log
          </div>
          <button 
            onClick={fetchExperiments}
            disabled={loadingList}
            className="text-xs font-medium text-text-muted hover:text-brand-primary disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loadingList ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>

        {loadingList ? (
          <div className="p-12 flex justify-center items-center flex-col gap-4">
            <RefreshCw size={24} className="text-text-muted animate-spin" />
            <p className="text-sm text-text-muted">Loading experiment records...</p>
          </div>
        ) : listError ? (
          <div className="p-12 text-center">
            <AlertTriangle size={32} className="text-accent-red mx-auto mb-4" />
            <p className="text-accent-red mb-4 text-sm">{listError}</p>
            <button
              onClick={fetchExperiments}
              className="px-4 py-2 bg-surface-alt hover:bg-secondary border border-border text-brand-primary rounded-md text-sm transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : experiments.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm">
            No experiment records found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-alt border-b border-border">
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">ID / Task</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Stress</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Node Role</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Divergence</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Perf.</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Truth</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Auditor</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {experiments.map((exp) => (
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
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${
                        exp.pressure?.toUpperCase() === 'HIGH' ? 'bg-accent-red/10 text-accent-red' :
                        exp.pressure?.toUpperCase() === 'MEDIUM' ? 'bg-accent-amber/10 text-accent-amber' :
                        'bg-accent-green/10 text-accent-green'
                      }`}>
                        {exp.pressure?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-brand-secondary">{exp.developer_role}</td>
                    <td className="p-4 text-xs font-medium">
                      {exp.deception_gap > 0 ? (
                        <span className="text-accent-amber">{exp.deception_gap.toFixed(1)}%</span>
                      ) : (
                        <span className="text-text-muted">{exp.deception_gap.toFixed(1)}%</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-brand-secondary">
                      {exp.performance_score.toFixed(2)}
                    </td>
                    <td className="p-4 text-xs text-brand-secondary">
                      {exp.honesty_score.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {exp.deception_detected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-red">
                          <AlertTriangle size={12} /> {exp.auditor_score.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">{exp.auditor_score.toFixed(2)}</span>
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
        )}
      </section>
    </div>
  );
}
