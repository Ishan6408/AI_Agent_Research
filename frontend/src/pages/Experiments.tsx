import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Experiment } from '../types/api';

export default function Experiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Execution states
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [runSuccess, setRunSuccess] = useState<string | null>(null);

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
      // Sort by some criteria if available, otherwise just use reverse to show latest first
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
      setRunSuccess(res.message);
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
      setRunSuccess(res.message);
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
    if (!window.confirm('Are you sure you want to run all experiments? This may take a long time.')) return;
    
    setRunningAction('all');
    setRunError(null);
    setRunSuccess(null);
    try {
      const res = await api.runAllExperiments({ runs: allRuns });
      setRunSuccess(res.message);
      fetchExperiments();
    } catch (err: any) {
      setRunError(err.message || 'Failed to run all experiments');
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-6 w-full max-w-full">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Execute Experiments</h2>
        
        {runError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-md">
            <p className="text-red-400 text-sm">{runError}</p>
          </div>
        )}
        
        {runSuccess && (
          <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-800 rounded-md">
            <p className="text-emerald-400 text-sm">{runSuccess}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Run Single */}
          <div className="p-4 border border-slate-800 rounded-lg bg-slate-800/30">
            <h3 className="text-lg font-medium text-white mb-4">Run Single</h3>
            <form onSubmit={handleRunSingle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Pressure Level</label>
                <select
                  value={singlePressure}
                  onChange={(e) => setSinglePressure(e.target.value)}
                  disabled={runningAction !== null}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-white text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={runningAction !== null}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {runningAction === 'single' ? (
                  <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Running...</>
                ) : 'Run Once'}
              </button>
            </form>
          </div>

          {/* Run Pressure */}
          <div className="p-4 border border-slate-800 rounded-lg bg-slate-800/30">
            <h3 className="text-lg font-medium text-white mb-4">Run Pressure Batch</h3>
            <form onSubmit={handleRunPressure} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Pressure Level</label>
                <select
                  value={pressureLevel}
                  onChange={(e) => setPressureLevel(e.target.value)}
                  disabled={runningAction !== null}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-white text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Number of Runs</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={pressureRuns}
                  onChange={(e) => setPressureRuns(parseInt(e.target.value, 10))}
                  disabled={runningAction !== null}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-white text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={runningAction !== null}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {runningAction === 'pressure' ? (
                  <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Running...</>
                ) : 'Run Batch'}
              </button>
            </form>
          </div>

          {/* Run All */}
          <div className="p-4 border border-slate-800 rounded-lg bg-slate-800/30">
            <h3 className="text-lg font-medium text-white mb-4">Run Full Suite</h3>
            <form onSubmit={handleRunAll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Runs per Pressure Level</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={allRuns}
                  onChange={(e) => setAllRuns(parseInt(e.target.value, 10))}
                  disabled={runningAction !== null}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-white text-sm focus:ring-rose-500 focus:border-rose-500 disabled:opacity-50"
                />
              </div>
              <div className="pt-16"> {/* Spacer to align button */}
                <button
                  type="submit"
                  disabled={runningAction !== null}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {runningAction === 'all' ? (
                    <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Running Suite...</>
                  ) : 'Run All Levels'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Recent Experiments Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm w-full max-w-full overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Recent Results</h2>
          <button 
            onClick={fetchExperiments}
            disabled={loadingList}
            className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loadingList ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : listError ? (
          <div className="p-6 text-center">
            <p className="text-red-400 mb-4">{listError}</p>
            <button
              onClick={fetchExperiments}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        ) : experiments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400">No experiments found. Run an experiment above to see results here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">ID / Task</th>
                  <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">Pressure</th>
                  <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">Developer</th>
                  <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">Deception Gap</th>
                  <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">Perf Score</th>
                  <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">Honesty</th>
                  <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">Auditor</th>
                  <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {experiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-xs text-indigo-400 mb-1 max-w-[120px] truncate" title={exp.id}>
                        {exp.id?.split('-')[0]}...
                      </div>
                      <div className="text-sm text-slate-300 truncate max-w-[150px]" title={exp.task_name}>
                        {exp.task_name}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        exp.pressure?.toUpperCase() === 'HIGH' ? 'bg-rose-900/30 text-rose-400 border border-rose-800' :
                        exp.pressure?.toUpperCase() === 'MEDIUM' ? 'bg-amber-900/30 text-amber-400 border border-amber-800' :
                        'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                      }`}>
                        {exp.pressure?.toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-300 whitespace-nowrap">{exp.developer_role}</td>
                    <td className="p-4 text-sm text-slate-300">
                      {exp.deception_gap.toFixed(1)}%
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {exp.performance_score.toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {exp.honesty_score.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${exp.deception_detected ? 'text-red-400 font-medium' : 'text-emerald-400'}`}>
                        {exp.auditor_score.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        to={`/experiments/${exp.id}`}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium whitespace-nowrap"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
