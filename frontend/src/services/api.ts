import type { Experiment, AnalyticsOverview, OverviewScatterPoint } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = {
  getExperiments: async (): Promise<Experiment[]> => {
    // Phase 3 placeholder implementation
    // Future Phase 4: 
    // const response = await fetch(`${API_BASE_URL}/experiments`);
    // return response.json();
    void API_BASE_URL;
    return Promise.resolve([] as Experiment[]);
  },
  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const response = await fetch(`${API_BASE_URL}/analytics/overview`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getOverviewScatter: async (): Promise<OverviewScatterPoint[]> => {
    const response = await fetch(`${API_BASE_URL}/analytics/overview/scatter`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
};
