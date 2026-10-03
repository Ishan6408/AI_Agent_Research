import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DatasetRecord, DatasetSummary } from '../types/api';

export default function Dataset() {
  const [data, setData] = useState<DatasetRecord[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering states
  const [pressureFilter, setPressureFilter] = useState<string>('');
  const [personalityFilter, setPersonalityFilter] = useState<string>('');
  const [developerFilter, setDeveloperFilter] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [datasetRes, summaryRes] = await Promise.all([
        api.getDataset(),
        api.getDatasetSummary()
      ]);
      
      setData(datasetRes);
      setSummary(summaryRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dataset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadCsv = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    window.location.href = `${API_BASE_URL}/dataset/export`;
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="h-24 bg-slate-800 rounded mb-4"></div>
        <div className="h-64 bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-red-400">Error Loading Dataset</h2>
        <p className="text-slate-300 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-4 text-white">Dataset Explorer</h2>
        <p className="text-slate-400">No experiment data available yet.</p>
      </div>
    );
  }

  const filteredData = data.filter(row => {
    if (pressureFilter && row.pressure !== pressureFilter) return false;
    if (personalityFilter && row.personality !== personalityFilter) return false;
    if (developerFilter && row.developer_role !== developerFilter) return false;
    return true;
  });

  const uniquePressures = Array.from(new Set(data.map(d => d.pressure))).filter(Boolean);
  const uniquePersonalities = Array.from(new Set(data.map(d => d.personality))).filter(Boolean);
  const uniqueDevelopers = Array.from(new Set(data.map(d => d.developer_role))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Overview / Metadata */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Dataset Explorer</h2>
            <p className="text-slate-400 text-sm">
              Explore the raw experimental data collected from AI agent simulations.
            </p>
          </div>
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded border border-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Total Records</div>
            <div className="text-2xl font-bold text-white">{summary?.total_experiments || data.length}</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Total Columns</div>
            <div className="text-2xl font-bold text-white">{summary?.column_count || '-'}</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Missing Values</div>
            <div className="text-2xl font-bold text-white">{summary?.missing_values ?? '-'}</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={pressureFilter}
            onChange={e => setPressureFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Pressures</option>
            {uniquePressures.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            value={personalityFilter}
            onChange={e => setPersonalityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Personalities</option>
            {uniquePersonalities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            value={developerFilter}
            onChange={e => setDeveloperFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Developer Roles</option>
            {uniqueDevelopers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          
          <div className="ml-auto text-sm text-slate-400 self-center">
            Showing {filteredData.length} records
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No records match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm text-left text-slate-300 min-w-[800px]">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 font-medium">Task Name</th>
                  <th className="px-4 py-3 font-medium">Developer</th>
                  <th className="px-4 py-3 font-medium">Pressure</th>
                  <th className="px-4 py-3 font-medium text-right">Performance</th>
                  <th className="px-4 py-3 font-medium text-right">Honesty</th>
                  <th className="px-4 py-3 font-medium text-right">Deception Gap</th>
                  <th className="px-4 py-3 font-medium">Detected</th>
                  <th className="px-4 py-3 font-medium text-right">Auditor Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredData.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-slate-800/50">
                    <td className="px-4 py-2 truncate max-w-[150px]" title={row.task_name}>{row.task_name}</td>
                    <td className="px-4 py-2">{row.developer_role}</td>
                    <td className="px-4 py-2">{row.pressure}</td>
                    <td className="px-4 py-2 text-right">
                      {row.performance_score != null ? row.performance_score.toFixed(1) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {row.honesty_score != null ? row.honesty_score.toFixed(1) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {row.deception_gap != null ? row.deception_gap.toFixed(1) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {row.deception_detected ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-400 border border-red-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-400 border border-green-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {row.auditor_score != null ? row.auditor_score.toFixed(1) : '-'}
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
