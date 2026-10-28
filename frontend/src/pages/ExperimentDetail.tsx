import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Experiment } from '../types/api';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useApiData } from '../hooks/useApiData';
import { Skeleton, BackgroundRefreshBadge, RevalidateErrorBanner } from '../components/common/Skeleton';

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: experiment,
    isLoading: isInitialLoading,
    isValidating,
    error,
    revalidateError,
    lastUpdated,
    refetch,
  } = useApiData<Experiment>(id ? `experiments/${id}` : null, () => api.getExperimentById(id!));

  if (isInitialLoading && !experiment) {
    return (
      <div className="flex flex-col min-h-full text-text-main gap-8 max-w-4xl mx-auto w-full pb-12">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden p-6 md:p-8 space-y-8 animate-shimmer">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-28 border-b border-border pb-2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
          <div className="space-y-4 pt-4 border-t border-border">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !experiment) {
    return (
      <div className="p-12 text-center border border-border bg-surface rounded-xl max-w-2xl mx-auto my-12">
        <AlertTriangle size={32} className="text-accent-red mx-auto mb-4" />
        <h3 className="text-brand-primary font-bold mb-2">Error Loading Experiment</h3>
        <p className="text-accent-red mb-6 text-sm font-mono">{error.message || 'Failed to load experiment'}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-surface-alt hover:bg-secondary border border-border text-brand-primary rounded-md text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="p-12 text-center border border-border bg-surface rounded-xl max-w-2xl mx-auto text-text-muted my-12">
        <p>Experiment not found.</p>
        <Link to="/experiments" className="text-accent-blue hover:underline text-sm mt-4 inline-block">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full text-text-main gap-8 max-w-4xl mx-auto w-full pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/experiments"
          className="flex items-center gap-2 text-text-muted hover:text-brand-primary text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to Experiments
        </Link>
        <BackgroundRefreshBadge
          isValidating={isValidating}
          lastUpdated={lastUpdated}
          onRefresh={() => refetch()}
        />
      </div>

      <RevalidateErrorBanner error={revalidateError} onRetry={() => refetch()} />

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
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              experiment.deception_detected
                ? 'bg-accent-red/10 text-accent-red border-accent-red/20'
                : 'bg-surface border-border text-text-muted'
            }`}
          >
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
                <span className="text-text-muted text-xs mb-0.5">Model</span>
                <span className="text-brand-primary font-medium">{experiment.model || '[NO_DATA]'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Seed</span>
                <span className="text-brand-primary font-medium font-mono tabular-nums">{experiment.seed ?? '[NO_DATA]'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Timestamp</span>
                <span className="text-brand-primary font-medium font-mono text-xs tabular-nums">{experiment.timestamp || '[NO_DATA]'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Task</span>
                <span className="text-brand-primary font-medium">{experiment.task_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Environmental Stress</span>
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
                <span className="text-brand-primary font-medium font-mono tabular-nums">{experiment.actual_progress.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Reported Progress</span>
                <span className="text-brand-primary font-medium font-mono tabular-nums">{experiment.reported_progress.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Performance Score</span>
                <span className="text-brand-primary font-medium font-mono tabular-nums">{experiment.performance_score.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Code Quality</span>
                <span className="text-brand-primary font-medium font-mono tabular-nums">{experiment.code_quality.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Bugs Introduced</span>
                <span className="text-brand-primary font-medium font-mono tabular-nums">{experiment.bugs_introduced}</span>
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
                <span className="text-text-muted text-xs mb-0.5">Honesty Score</span>
                <span className="text-brand-primary font-medium font-mono tabular-nums">{experiment.honesty_score.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Deception Gap</span>
                <span className="font-medium font-mono tabular-nums text-accent-amber">{experiment.deception_gap.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Stress Index</span>
                <span className="text-brand-primary font-medium font-mono tabular-nums">{experiment.stress_index.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Tactic Executed</span>
                <span className="text-brand-primary font-medium">{experiment.behavior_strategy}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Severity Level</span>
                <span className="text-brand-primary font-medium capitalize">{experiment.deception_level?.toLowerCase().replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Auditor */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">
              Auditor Assessment
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Auditor Strictness Score</span>
                <span className="text-brand-primary font-medium font-mono tabular-nums">{experiment.auditor_score.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Deception Flag</span>
                <span className={`font-medium ${experiment.deception_detected ? 'text-accent-red' : 'text-accent-green'}`}>
                  {experiment.deception_detected ? 'DETECTED' : 'CLEARED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Logs */}
        <div className="p-6 md:p-8 border-t border-border space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Developer Reasoning & Communication
            </h3>
            <div className="bg-surface-alt border border-border rounded-lg p-4 font-mono text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
              {experiment.developer_reasoning || experiment.manager_message || '[No communication log recorded]'}
            </div>
          </div>

          {(experiment.auditor_explanation || (experiment as any).auditor_feedback) && (
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Auditor Findings & Feedback
              </h3>
              <div className="bg-surface-alt border border-border rounded-lg p-4 font-mono text-xs text-brand-secondary leading-relaxed whitespace-pre-wrap">
                {experiment.auditor_explanation || (experiment as any).auditor_feedback}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
