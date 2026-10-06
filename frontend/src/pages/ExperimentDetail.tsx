import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Experiment } from '../types/api';
import { ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiment = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getExperimentById(id);
      setExperiment(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load experiment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 w-full gap-4">
        <RefreshCw size={24} className="text-text-muted animate-spin" />
        <p className="text-sm text-text-muted">Loading experiment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center border border-border bg-surface rounded-xl max-w-2xl mx-auto">
        <AlertTriangle size={32} className="text-accent-red mx-auto mb-4" />
        <h3 className="text-brand-primary font-bold mb-2">Error Loading Experiment</h3>
        <p className="text-accent-red mb-6 text-sm">{error}</p>
        <button
          onClick={fetchExperiment}
          className="px-4 py-2 bg-surface-alt hover:bg-secondary border border-border text-brand-primary rounded-md text-sm transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="p-12 text-center border border-border bg-surface rounded-xl max-w-2xl mx-auto text-text-muted">
        <p>Experiment not found.</p>
        <Link to="/experiments" className="text-accent-blue hover:underline text-sm mt-4 inline-block">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-text-main gap-8 max-w-4xl mx-auto w-full pb-12">
      <div className="flex items-center space-x-4">
        <Link
          to="/experiments"
          className="flex items-center gap-2 text-text-muted hover:text-brand-primary text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to Experiments
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border bg-surface-alt flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-brand-primary mb-1">
              Experiment Record
            </h2>
            <p className="text-text-muted text-xs font-mono break-all">
              {experiment.id}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${experiment.deception_detected ? 'bg-accent-red/10 text-accent-red border-accent-red/20' : 'bg-surface border-border text-text-muted'}`}>
            {experiment.deception_detected ? 'Anomalous Behavior Flagged' : 'Standard Execution'}
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Setup Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">
              Setup Parameters
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Task</span>
                <span className="text-brand-primary font-medium">{experiment.task_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Pressure Condition</span>
                <span className="text-brand-primary font-medium capitalize">{experiment.pressure?.toLowerCase()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Developer Role</span>
                <span className="text-brand-primary font-medium">{experiment.developer_role}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Personality Profile</span>
                <span className="text-brand-primary font-medium capitalize">{experiment.personality?.toLowerCase()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Task Difficulty</span>
                <span className="text-brand-primary font-medium capitalize">{experiment.task_difficulty?.toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">
              Performance Outcomes
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Actual Progress</span>
                <span className="text-brand-primary font-medium">{experiment.actual_progress.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Reported Progress</span>
                <span className="text-brand-primary font-medium">{experiment.reported_progress.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Performance Score</span>
                <span className="text-brand-primary font-medium">{experiment.performance_score.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Code Quality</span>
                <span className="text-brand-primary font-medium">{experiment.code_quality.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Bugs Introduced</span>
                <span className="text-brand-primary font-medium">{experiment.bugs_introduced}</span>
              </div>
            </div>
          </div>

          {/* Behaviour */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">
              Behavioral Metrics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Strategy Employed</span>
                <span className="text-brand-primary font-medium">{experiment.behavior_strategy}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Deception Classification</span>
                <span className="text-brand-primary font-medium">{experiment.deception_level || 'None'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Deception Gap</span>
                <span className={`font-medium ${experiment.deception_gap > 0 ? 'text-accent-amber' : 'text-brand-primary'}`}>
                  {experiment.deception_gap > 0 ? `+${experiment.deception_gap.toFixed(1)}%` : `${experiment.deception_gap.toFixed(1)}%`}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Honesty Score</span>
                <span className="text-brand-primary font-medium">{experiment.honesty_score.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Stress Index</span>
                <span className="text-brand-primary font-medium">{experiment.stress_index.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Auditor */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">
              Auditor Evaluation
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Auditor Score</span>
                <span className="text-brand-primary font-medium">{experiment.auditor_score.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Deception Detected</span>
                <span className={`font-medium ${experiment.deception_detected ? 'text-accent-red' : 'text-accent-green'}`}>
                  {experiment.deception_detected ? 'Yes (Flagged)' : 'No (Clear)'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Texts */}
        <div className="p-6 md:p-8 border-t border-border space-y-8 bg-surface-alt/30">
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Manager Message</h3>
            <div className="bg-surface border border-border p-5 rounded-lg text-brand-secondary text-sm whitespace-pre-wrap font-mono shadow-sm">
              {experiment.manager_message || 'N/A'}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Developer Reasoning</h3>
            <div className="bg-surface border border-border p-5 rounded-lg text-brand-secondary text-sm whitespace-pre-wrap font-mono shadow-sm">
              {experiment.developer_reasoning || 'N/A'}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Auditor Explanation</h3>
            <div className="bg-surface border border-border p-5 rounded-lg text-brand-secondary text-sm whitespace-pre-wrap font-mono shadow-sm">
              {experiment.auditor_explanation || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
