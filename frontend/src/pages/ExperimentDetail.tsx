import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Experiment } from '../types/api';

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
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-red-900/50 rounded-lg p-6">
        <h3 className="text-red-400 font-semibold mb-2">Error</h3>
        <p className="text-slate-300 mb-4">{error}</p>
        <button
          onClick={fetchExperiment}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <p className="text-slate-400">Experiment not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/experiments"
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
        >
          &larr; Back to Experiments
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white mb-1">
            Experiment Details
          </h2>
          <p className="text-slate-400 text-sm break-all font-mono">
            {experiment.id}
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Experiment Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Setup
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Task: </span>
                <span className="text-white">{experiment.task_name}</span>
              </div>
              <div>
                <span className="text-slate-500">Pressure: </span>
                <span className="text-white capitalize">{experiment.pressure?.toLowerCase()}</span>
              </div>
              <div>
                <span className="text-slate-500">Developer: </span>
                <span className="text-white">{experiment.developer_role}</span>
              </div>
              <div>
                <span className="text-slate-500">Personality: </span>
                <span className="text-white capitalize">{experiment.personality?.toLowerCase()}</span>
              </div>
              <div>
                <span className="text-slate-500">Difficulty: </span>
                <span className="text-white capitalize">{experiment.task_difficulty?.toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Performance
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Actual Progress: </span>
                <span className="text-white">{experiment.actual_progress.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-500">Reported Progress: </span>
                <span className="text-white">{experiment.reported_progress.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-500">Perf Score: </span>
                <span className="text-white">{experiment.performance_score.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Code Quality: </span>
                <span className="text-white">{experiment.code_quality.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Bugs: </span>
                <span className="text-white">{experiment.bugs_introduced}</span>
              </div>
            </div>
          </div>

          {/* Behaviour */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Behaviour
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Strategy: </span>
                <span className="text-white">{experiment.behavior_strategy}</span>
              </div>
              <div>
                <span className="text-slate-500">Deception Level: </span>
                <span className="text-white">{experiment.deception_level || 'None'}</span>
              </div>
              <div>
                <span className="text-slate-500">Deception Gap: </span>
                <span className="text-white">{experiment.deception_gap.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-500">Honesty Score: </span>
                <span className="text-white">{experiment.honesty_score.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Stress Index: </span>
                <span className="text-white">{experiment.stress_index.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Auditor */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Auditor
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Auditor Score: </span>
                <span className="text-white">{experiment.auditor_score.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Detected: </span>
                <span className={`font-medium ${experiment.deception_detected ? 'text-red-400' : 'text-emerald-400'}`}>
                  {experiment.deception_detected ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Texts */}
        <div className="p-6 border-t border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Manager Message</h3>
            <div className="bg-slate-950 p-4 rounded-md border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap font-mono">
              {experiment.manager_message || 'N/A'}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Developer Reasoning</h3>
            <div className="bg-slate-950 p-4 rounded-md border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap font-mono">
              {experiment.developer_reasoning || 'N/A'}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Auditor Explanation</h3>
            <div className="bg-slate-950 p-4 rounded-md border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap font-mono">
              {experiment.auditor_explanation || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
