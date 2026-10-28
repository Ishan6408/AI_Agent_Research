import { api } from '../services/api';
import type { AgentResponse } from '../types/api';
import { Users, AlertTriangle, RefreshCw, BarChart, ShieldAlert } from 'lucide-react';
import { useApiData } from '../hooks/useApiData';
import { AgentCardSkeleton, BackgroundRefreshBadge, RevalidateErrorBanner } from '../components/common/Skeleton';

export default function Agents() {
  const {
    data: agents,
    isLoading: isInitialLoading,
    isValidating,
    error,
    revalidateError,
    lastUpdated,
    refetch,
  } = useApiData<AgentResponse[]>('agents/list', api.getAgents);

  const getRoleStyle = (role: string) => {
    const lrole = role.toLowerCase();
    if (lrole.includes('frontend')) return 'bg-accent-blue/10 text-accent-blue border-accent-blue/20';
    if (lrole.includes('backend')) return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
    if (lrole.includes('qa')) return 'bg-accent-green/10 text-accent-green border-accent-green/20';
    if (lrole.includes('devops')) return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20';
    if (lrole.includes('auditor')) return 'bg-accent-red/10 text-accent-red border-accent-red/20';
    return 'bg-secondary text-brand-secondary border-border';
  };

  const getAvatarInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  if (error && !agents) {
    return (
      <div className="p-12 text-center border border-border bg-surface rounded-xl max-w-2xl mx-auto my-12">
        <AlertTriangle size={32} className="text-accent-red mx-auto mb-4" />
        <p className="text-accent-red mb-4 text-sm font-mono">{error.message || 'Failed to load agents'}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-surface-alt hover:bg-secondary border border-border text-brand-primary rounded-md text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const agentList = agents || [];

  return (
    <div className="flex flex-col min-h-full text-text-main gap-8 max-w-6xl mx-auto w-full pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 border-b border-border pb-4 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-primary mb-2">Agent Directory</h1>
          <p className="text-text-muted max-w-2xl text-sm">
            Profiles, core duties, and aggregated behavioral metrics for the LLM personas evaluated in the study.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <BackgroundRefreshBadge
            isValidating={isValidating}
            lastUpdated={lastUpdated}
            onRefresh={() => refetch()}
          />
          <button
            onClick={() => refetch()}
            disabled={isValidating}
            className="flex items-center gap-2 text-sm font-medium text-accent-blue hover:text-accent-blue/80 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={isValidating ? 'animate-spin' : ''} />
            <span>{isValidating ? 'Syncing...' : 'Sync Records'}</span>
          </button>
        </div>
      </header>

      <RevalidateErrorBanner error={revalidateError} onRetry={() => refetch()} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isInitialLoading && !agents ? (
          Array.from({ length: 6 }).map((_, i) => <AgentCardSkeleton key={i} />)
        ) : (
          agentList.map((agent) => {
            const roleStyle = getRoleStyle(agent.role);

            return (
              <div
                key={agent.role}
                className="flex flex-col bg-surface border border-border rounded-xl shadow-sm overflow-hidden hover:border-brand-secondary/30 transition-all"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${roleStyle}`}
                      >
                        {getAvatarInitials(agent.name)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-brand-primary leading-tight">{agent.name}</h3>
                        <p className="text-xs font-medium text-text-muted mt-1 uppercase tracking-wide">
                          {agent.role.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 flex-1">
                    {/* Responsibilities */}
                    <div>
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users size={14} /> Core Duties
                      </h4>
                      <ul className="text-sm text-brand-secondary space-y-1.5 list-disc list-inside">
                        {agent.responsibilities.slice(0, 3).map((resp, i) => (
                          <li key={i} className="leading-snug truncate" title={resp}>
                            {resp}
                          </li>
                        ))}
                        {agent.responsibilities.length > 3 && (
                          <li className="text-xs text-text-muted italic list-none mt-1">
                            +{agent.responsibilities.length - 3} additional directives...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Personalities */}
                      <div>
                        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Traits</h4>
                        <div className="flex flex-col gap-1.5">
                          {agent.personality_options.map((p, i) => (
                            <div
                              key={i}
                              className="text-xs text-brand-secondary bg-secondary rounded-md px-2 py-1 truncate"
                              title={p}
                            >
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strategies */}
                      <div>
                        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Tactics</h4>
                        <div className="flex flex-col gap-1.5">
                          {agent.behaviour_strategies.map((s, i) => (
                            <div
                              key={i}
                              className="text-xs text-brand-secondary bg-secondary rounded-md px-2 py-1 truncate"
                              title={s}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {agent.metrics && (
                    <div className="mt-6 pt-5 border-t border-border grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
                          <ShieldAlert size={12} className="text-accent-red" /> Deception Gap
                        </span>
                        <span className="text-lg font-bold text-brand-primary tabular-nums font-mono">
                          {agent.metrics.avg_deception_gap !== undefined && agent.metrics.avg_deception_gap !== null
                            ? `${agent.metrics.avg_deception_gap.toFixed(1)}%`
                            : '--'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
                          <BarChart size={12} className="text-accent-green" /> Efficacy Rating
                        </span>
                        <span className="text-lg font-bold text-brand-primary tabular-nums font-mono">
                          {agent.metrics.avg_performance_score !== undefined && agent.metrics.avg_performance_score !== null
                            ? agent.metrics.avg_performance_score.toFixed(2)
                            : '--'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
