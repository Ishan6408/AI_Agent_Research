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
  },
  getPressure: async (): Promise<import('../types/api').GroupAnalysisRow[]> => {
    const response = await fetch(`${API_BASE_URL}/analytics/pressure`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getPersonality: async (): Promise<import('../types/api').GroupAnalysisRow[]> => {
    const response = await fetch(`${API_BASE_URL}/analytics/personality`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getDevelopers: async (): Promise<import('../types/api').GroupAnalysisRow[]> => {
    const response = await fetch(`${API_BASE_URL}/analytics/developers`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getBehavior: async (): Promise<import('../types/api').GroupAnalysisRow[]> => {
    const response = await fetch(`${API_BASE_URL}/analytics/behavior`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getAuditor: async (): Promise<import('../types/api').AuditorAnalysis> => {
    const response = await fetch(`${API_BASE_URL}/analytics/auditor`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getDataset: async (): Promise<import('../types/api').DatasetRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/dataset`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
};
