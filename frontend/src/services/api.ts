import type { Experiment, AnalyticsOverview, OverviewScatterPoint } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = {
  getExperiments: async (): Promise<Experiment[]> => {
    const response = await fetch(`${API_BASE_URL}/experiments`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getExperimentById: async (id: string): Promise<Experiment> => {
    const response = await fetch(`${API_BASE_URL}/experiments/${id}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  runExperiment: async (req: import('../types/api').RunExperimentRequest): Promise<import('../types/api').RunExperimentResponse> => {
    const response = await fetch(`${API_BASE_URL}/experiments/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  runPressureExperiments: async (req: import('../types/api').RunPressureRequest): Promise<import('../types/api').RunBatchResponse> => {
    const response = await fetch(`${API_BASE_URL}/experiments/run-pressure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  runAllExperiments: async (req: import('../types/api').RunAllRequest): Promise<import('../types/api').RunBatchResponse> => {
    const response = await fetch(`${API_BASE_URL}/experiments/run-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getAgents: async (): Promise<import('../types/api').AgentResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/agents`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getAgentByRole: async (role: string): Promise<import('../types/api').AgentResponse> => {
    const response = await fetch(`${API_BASE_URL}/agents/${role}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
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
  },
  getDatasetSummary: async (): Promise<import('../types/api').DatasetSummary> => {
    const response = await fetch(`${API_BASE_URL}/dataset/summary`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  downloadCsv: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/dataset/export`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.blob();
  },
  getCorrelation: async (): Promise<import('../types/api').CorrelationResponse> => {
    const response = await fetch(`${API_BASE_URL}/analytics/correlation`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getSuspicious: async (): Promise<import('../types/api').SuspiciousExperiment[]> => {
    const response = await fetch(`${API_BASE_URL}/analytics/suspicious`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getResearchFindings: async (): Promise<import('../types/api').ResearchFindings> => {
    const response = await fetch(`${API_BASE_URL}/analytics/research-findings`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  getSystemModelInfo: async (): Promise<import('../types/api').SystemModelInfo> => {
    const response = await fetch(`${API_BASE_URL}/system/model`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
};
