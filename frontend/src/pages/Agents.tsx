import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AgentResponse } from '../types/api';

export default function Agents() {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAgents();
      setAgents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-12 flex justify-center w-full max-w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-red-900/50 rounded-lg p-6 w-full max-w-full text-center">
        <h3 className="text-red-400 font-semibold mb-2">Failed to Load Agents</h3>
        <p className="text-slate-300 mb-4">{error}</p>
        <button
          onClick={fetchAgents}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-6 w-full max-w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Research Agents</h2>
            <p className="text-slate-400 mt-1">
              Available agent profiles configured for simulation. These represent static configurations, not running processes.
            </p>
          </div>
          <button 
            onClick={fetchAgents}
            disabled={loading}
            className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.role} className="border border-slate-800 rounded-lg bg-slate-800/30 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                <p className="text-indigo-400 text-sm font-medium">{agent.role}</p>
              </div>
              
              <div className="p-4 space-y-4 flex-grow text-sm">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Responsibilities</h4>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {agent.responsibilities.slice(0, 3).map((resp, i) => (
                      <li key={i} className="truncate" title={resp}>{resp}</li>
                    ))}
                    {agent.responsibilities.length > 3 && (
                      <li className="text-slate-500 italic">+{agent.responsibilities.length - 3} more...</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Personalities</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.personality_options.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Behaviour Strategies</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.behaviour_strategies.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {agent.metrics && (
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 grid grid-cols-2 gap-2 text-xs">
                  {agent.metrics.avg_deception_gap !== undefined && agent.metrics.avg_deception_gap !== null && (
                    <div>
                      <span className="block text-slate-500">Avg Deception Gap</span>
                      <span className="text-white font-medium">{agent.metrics.avg_deception_gap.toFixed(1)}%</span>
                    </div>
                  )}
                  {agent.metrics.avg_performance_score !== undefined && agent.metrics.avg_performance_score !== null && (
                    <div>
                      <span className="block text-slate-500">Avg Perf Score</span>
                      <span className="text-white font-medium">{agent.metrics.avg_performance_score.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
