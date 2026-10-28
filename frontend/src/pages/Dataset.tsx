import { useState } from 'react';
import { api } from '../services/api';
import type { DatasetRecord, DatasetSummary } from '../types/api';
import { Database, Download, AlertTriangle, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useApiData } from '../hooks/useApiData';
import { KPISkeleton, TableSkeleton, BackgroundRefreshBadge, RevalidateErrorBanner } from '../components/common/Skeleton';

export default function Dataset() {
  const {
    data: rawData,
    isLoading: isDatasetLoading,
    isValidating: isDatasetValidating,
    error: datasetError,
    revalidateError: datasetRevalError,
    lastUpdated: datasetUpdated,
    refetch: refetchDataset,
  } = useApiData<DatasetRecord[]>('dataset/records', api.getDataset);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isValidating: isSummaryValidating,
    error: summaryError,
    revalidateError: summaryRevalError,
    refetch: refetchSummary,
  } = useApiData<DatasetSummary>('dataset/summary', api.getDatasetSummary);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filters
  const [pressureFilter, setPressureFilter] = useState<string>('');
  const [personalityFilter, setPersonalityFilter] = useState<string>('');
  const [developerFilter, setDeveloperFilter] = useState<string>('');

  const [downloading, setDownloading] = useState(false);

  const handleRefresh = () => {
    refetchDataset();
    refetchSummary();
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
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
    } finally {
      setDownloading(false);
    }
  };

  const isInitialLoading = (isDatasetLoading && !rawData) || (isSummaryLoading && !summary);
  const blockingError = (!rawData && datasetError) || (!summary && summaryError);
  const revalidateError = datasetRevalError || summaryRevalError;
  const isValidating = isDatasetValidating || isSummaryValidating;

  if (blockingError) {
    return (
      <div className="p-12 text-center border border-border bg-surface rounded-xl max-w-2xl mx-auto my-12">
        <AlertTriangle size={32} className="text-accent-red mx-auto mb-4" />
        <p className="text-accent-red mb-4 text-sm font-mono">{blockingError.message || 'Failed to load dataset'}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-surface-alt hover:bg-secondary border border-border text-brand-primary rounded-md text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const data = rawData || [];

  const filteredData = data.filter((row) => {
    if (pressureFilter && row.pressure !== pressureFilter) return false;
    if (personalityFilter && row.personality !== personalityFilter) return false;
    if (developerFilter && row.developer_role !== developerFilter) return false;
    return true;
  });

  const uniquePressures = Array.from(new Set(data.map((d) => d.pressure))).filter(Boolean);
  const uniquePersonalities = Array.from(new Set(data.map((d) => d.personality))).filter(Boolean);
  const uniqueDevelopers = Array.from(new Set(data.map((d) => d.developer_role))).filter(Boolean);

  return (
    <div className="flex flex-col min-h-full text-text-main gap-8 max-w-6xl mx-auto w-full pb-12">
      {/* Overview / Metadata */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-2 border-b border-border pb-4 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-primary mb-2">Raw Dataset</h1>
          <p className="text-text-muted max-w-2xl text-sm">
            Direct access to experimental records, metrics, and telemetry from all executed simulations.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <BackgroundRefreshBadge
            isValidating={isValidating}
            lastUpdated={datasetUpdated}
            onRefresh={handleRefresh}
          />
          <button
            onClick={handleDownloadCsv}
            disabled={downloading || isInitialLoading}
            className="flex items-center gap-2 bg-surface-alt hover:bg-secondary text-brand-primary px-4 py-2 rounded-md text-sm font-medium transition-colors border border-border disabled:opacity-50 cursor-pointer"
          >
            <Download size={16} />
            {downloading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </header>

      <RevalidateErrorBanner error={revalidateError} onRetry={handleRefresh} />

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isInitialLoading && !summary ? (
          <>
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
          </>
        ) : (
          <>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Total Records</div>
              <div className="text-3xl font-bold text-brand-primary font-mono tabular-nums">
                {summary?.total_experiments || data.length}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Mapped Columns</div>
              <div className="text-3xl font-bold text-brand-primary font-mono tabular-nums">
                {summary?.column_count || '-'}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Missing Values</div>
              <div className="text-3xl font-bold text-brand-primary font-mono tabular-nums">
                {summary?.missing_values ?? '-'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Table Section */}
      {isInitialLoading && !rawData ? (
        <TableSkeleton rows={8} columns={8} />
      ) : data.length === 0 ? (
        <div className="p-12 text-center border border-border bg-surface rounded-xl text-text-muted">
          <Database size={32} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-bold mb-2 text-brand-primary">Dataset Empty</h2>
          <p className="text-sm">No records found in the experimental database.</p>
        </div>
      ) : (
        (() => {
          const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
          const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
          const paginatedData = filteredData.slice(
            (validCurrentPage - 1) * pageSize,
            validCurrentPage * pageSize
          );

          return (
            <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-surface-alt border-b border-border px-4 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Filter size={16} className="text-text-muted" />
                  <select
                    value={pressureFilter}
                    onChange={(e) => {
                      setPressureFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-surface border border-border rounded-md text-brand-primary px-3 py-1.5 text-xs focus:ring-1 focus:ring-accent-blue outline-none cursor-pointer"
                  >
                    <option value="">All Pressures</option>
                    {uniquePressures.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <select
                    value={personalityFilter}
                    onChange={(e) => {
                      setPersonalityFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-surface border border-border rounded-md text-brand-primary px-3 py-1.5 text-xs focus:ring-1 focus:ring-accent-blue outline-none cursor-pointer"
                  >
                    <option value="">All Personalities</option>
                    {uniquePersonalities.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <select
                    value={developerFilter}
                    onChange={(e) => {
                      setDeveloperFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-surface border border-border rounded-md text-brand-primary px-3 py-1.5 text-xs focus:ring-1 focus:ring-accent-blue outline-none cursor-pointer"
                  >
                    <option value="">All Dev Roles</option>
                    {uniqueDevelopers.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-surface border border-border rounded-md text-brand-primary px-3 py-1.5 text-xs focus:ring-1 focus:ring-accent-blue outline-none cursor-pointer font-mono tabular-nums"
                  >
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                    <option value={250}>250 / page</option>
                  </select>
                </div>

                <div className="text-xs font-medium text-text-muted whitespace-nowrap self-end sm:self-center font-mono">
                  <span className="tabular-nums font-bold text-brand-primary">{filteredData.length.toLocaleString()}</span> records match
                </div>
              </div>

              {filteredData.length === 0 ? (
                <div className="p-12 text-center text-text-muted text-sm font-mono">
                  No records match the current filters.
                </div>
              ) : (
                <>
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
                        {paginatedData.map((row, i) => (
                          <tr key={row.id || i} className="hover:bg-secondary transition-colors group">
                            <td className="p-4 max-w-[200px] truncate text-xs text-brand-secondary" title={row.task_name}>
                              {row.task_name}
                            </td>
                            <td className="p-4 text-xs text-brand-secondary">{row.developer_role}</td>
                            <td className="p-4">
                              <span
                                className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${
                                  row.pressure?.toUpperCase() === 'HIGH'
                                    ? 'bg-accent-red/10 text-accent-red'
                                    : row.pressure?.toUpperCase() === 'MEDIUM'
                                    ? 'bg-accent-amber/10 text-accent-amber'
                                    : 'bg-accent-green/10 text-accent-green'
                                }`}
                              >
                                {row.pressure?.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-right text-xs text-brand-secondary tabular-nums font-mono">
                              {row.performance_score != null ? row.performance_score.toFixed(1) : '-'}
                            </td>
                            <td className="p-4 text-right text-xs text-brand-secondary tabular-nums font-mono">
                              {row.honesty_score != null ? row.honesty_score.toFixed(1) : '-'}
                            </td>
                            <td className="p-4 text-right text-xs font-medium tabular-nums font-mono">
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
                            <td className="p-4 text-right text-xs text-brand-secondary tabular-nums font-mono">
                              {row.auditor_score != null ? row.auditor_score.toFixed(1) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="bg-surface-alt border-t border-border px-4 py-3 flex items-center justify-between">
                    <div className="text-xs text-text-muted font-mono">
                      Page <span className="font-bold text-brand-primary tabular-nums">{validCurrentPage}</span> of{' '}
                      <span className="font-bold text-brand-primary tabular-nums">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={validCurrentPage === 1}
                        className="p-1 rounded hover:bg-secondary text-text-muted hover:text-brand-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="First Page"
                      >
                        <ChevronsLeft size={16} />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={validCurrentPage === 1}
                        className="p-1 rounded hover:bg-secondary text-text-muted hover:text-brand-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={validCurrentPage === totalPages}
                        className="p-1 rounded hover:bg-secondary text-text-muted hover:text-brand-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Next Page"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={validCurrentPage === totalPages}
                        className="p-1 rounded hover:bg-secondary text-text-muted hover:text-brand-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Last Page"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          );
        })()
      )}
    </div>
  );
}
