import type { Experiment } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = {
  getExperiments: async (): Promise<Experiment[]> => {
    // Phase 3 placeholder implementation
    // Future Phase 4: 
    // const response = await fetch(`${API_BASE_URL}/experiments`);
    // return response.json();
    void API_BASE_URL;
    return Promise.resolve([] as Experiment[]);
  }
};
