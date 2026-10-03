import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AnalyticsOverview, OverviewScatterPoint } from '../types/api';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { OverviewCharts } from '../components/dashboard/OverviewCharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [scatter, setScatter] = useState<OverviewScatterPoint[] | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, scatterData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getOverviewScatter()
      ]);
      setOverview(overviewData);
      setScatter(scatterData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-4 sm:p-6 w-full">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white">Dashboard</h2>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-800 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[350px] bg-slate-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-4 sm:p-6 w-full text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Dashboard</h2>
        <div className="bg-red-900/50 border border-red-800 text-red-200 p-4 rounded-lg mb-4 inline-block">
          <p>{error}</p>
        </div>
        <br />
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded transition-colors"
          aria-label="Retry loading dashboard"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!overview || overview.total_experiments === 0 || !scatter || scatter.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-4 sm:p-6 w-full text-center text-slate-300">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white text-left">Dashboard</h2>
        <p className="mt-8 mb-8 text-lg">No experiment data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-4 sm:p-6 w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white">Dashboard</h2>
      <KPIGrid data={overview} />
      <OverviewCharts overviewData={overview} scatterData={scatter} />
    </div>
  );
}
