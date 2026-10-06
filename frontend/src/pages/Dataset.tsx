import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DatasetRecord, DatasetSummary } from '../types/api';
import { Database, Download, AlertTriangle, RefreshCw, Filter } from 'lucide-react';

export default function Dataset() {
  const [data, setData] = useState<DatasetRecord[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [pressureFilter, setPressureFilter] = useState<string>('');
  const [personalityFilter, setPersonalityFilter] = useState<string>('');
  const [developerFilter, setDeveloperFilter] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [datasetData, summaryData] = await Promise.all([
        api.getDataset(),
        api.getDatasetSummary()
      ]);
      setData(datasetData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadCsv = async () => {
    try {
      const blob = await api.downloadCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'experiments_dataset.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to download CSV: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 w-full gap-4">
        <RefreshCw size={24} className="text-text-muted animate-spin" />
        <p className="text-sm text-text-muted">Loading dataset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center border border-border bg-surface rounded-xl">
        <AlertTriangle size={32} className="text-accent-red mx-auto mb-4" />
        <p className="text-accent-red mb-4 text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-surface-alt hover:bg-secondary border border-border text-brand-primary rounded-md text-sm transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center border border-border bg-surface rounded-xl text-text-muted">
        <Database size={32} className="mx-auto mb-4 opacity-50" />
        <h2 className="text-lg font-bold mb-2 text-brand-primary">Dataset Empty</h2>
        <p className="text-sm">No records found in the experimental database.</p>
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
    <div className="flex flex-col h-full text-text-main gap-8 max-w-6xl mx-auto w-full pb-12">
      {/* Overview / Metadata */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-2 border-b border-border pb-4 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-primary mb-2">Raw Dataset</h1>
          <p className="text-text-muted max-w-2xl text-sm">
            Direct access to experimental records, metrics, and telemetry from all executed simulations.
          </p>
        </div>
        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 bg-surface-alt hover:bg-secondary text-brand-primary px-4 py-2 rounded-md text-sm font-medium transition-colors border border-border"
        >
          <Download size={16} />
          Export CSV
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Total Records</div>
          <div className="text-3xl font-bold text-brand-primary">{summary?.total_experiments || data.length}</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Mapped Columns</div>
          <div className="text-3xl font-bold text-brand-primary">{summary?.column_count || '-'}</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Missing Values</div>
          <div className="text-3xl font-bold text-brand-primary">{summary?.missing_values ?? '-'}</div>
        </div>
      </div>

      {/* Table Section */}
      <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="bg-surface-alt border-b border-border px-4 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-text-muted" />
            <select
              value={pressureFilter}
              onChange={e => setPressureFilter(e.target.value)}
              className="bg-surface border border-border rounded-md text-brand-primary px-3 py-1.5 text-xs focus:ring-1 focus:ring-accent-blue outline-none"
            >
              <option value="">All Pressures</option>
              {uniquePressures.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={personalityFilter}
              onChange={e => setPersonalityFilter(e.target.value)}
              className="bg-surface border border-border rounded-md text-brand-primary px-3 py-1.5 text-xs focus:ring-1 focus:ring-accent-blue outline-none"
            >
              <option value="">All Personalities</option>
              {uniquePersonalities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={developerFilter}
              onChange={e => setDeveloperFilter(e.target.value)}
              className="bg-surface border border-border rounded-md text-brand-primary px-3 py-1.5 text-xs focus:ring-1 focus:ring-accent-blue outline-none"
            >
              <option value="">All Dev Roles</option>
              {uniqueDevelopers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="text-xs font-medium text-text-muted whitespace-nowrap self-end sm:self-center">
            {filteredData.length} records match
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm">
            No records match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-surface-alt border-b border-border">
                <tr>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Task Name</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Dev Role</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Pressure</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap text-right">Perf</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap text-right">Honesty</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap text-right">Gap</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap">Flagged</th>
                  <th className="p-4 text-xs font-semibold text-text-muted tracking-wide whitespace-nowrap text-right">Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-secondary transition-colors group">
                    <td className="p-4 max-w-[200px] truncate text-xs text-brand-secondary" title={row.task_name}>{row.task_name}</td>
                    <td className="p-4 text-xs text-brand-secondary">{row.developer_role}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${
                        row.pressure?.toUpperCase() === 'HIGH' ? 'bg-accent-red/10 text-accent-red' :
                        row.pressure?.toUpperCase() === 'MEDIUM' ? 'bg-accent-amber/10 text-accent-amber' :
                        'bg-accent-green/10 text-accent-green'
                      }`}>
                        {row.pressure?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs text-brand-secondary">
                      {row.performance_score != null ? row.performance_score.toFixed(1) : '-'}
                    </td>
                    <td className="p-4 text-right text-xs text-brand-secondary">
                      {row.honesty_score != null ? row.honesty_score.toFixed(1) : '-'}
                    </td>
                    <td className="p-4 text-right text-xs font-medium">
                      {row.deception_gap > 0 ? (
                        <span className="text-accent-amber">{row.deception_gap.toFixed(1)}%</span>
                      ) : (
                        <span className="text-text-muted">{row.deception_gap?.toFixed(1) || '-'}%</span>
                      )}
                    </td>
                    <td className="p-4">
                      {row.deception_detected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent-red bg-accent-red/10 px-1.5 py-0.5 rounded-full border border-accent-red/20">
                          <AlertTriangle size={10} /> Flagged
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted">Clear</span>
                      )}
                    </td>
                    <td className="p-4 text-right text-xs text-brand-secondary">
                      {row.auditor_score != null ? row.auditor_score.toFixed(1) : '-'}
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
