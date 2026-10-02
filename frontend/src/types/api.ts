export interface Experiment {
  id: string;
  name: string;
  status: string;
  // Extensible for future Phase 4 implementation
}

export interface RunPressureRequest {
  pressure: string;
  runs?: number;
}

export interface RunAllRequest {
  runs?: number;
}

export interface RunExperimentRequest {
  pressure: string;
}

export interface AgentResponse {
  name: string;
  role: string;
  personality_options: string[];
  behaviour_strategies: string[];
  responsibilities: string[];
  metrics?: Record<string, unknown>;
}

export interface AnalyticsResponse {
  // Placeholder based on typical analytics response
  data: Record<string, unknown>;
}

export interface DatasetResponse {
  // Placeholder
  records: Record<string, unknown>[];
}

export interface AuditorResponse {
  // Placeholder
  score: number;
  explanation: string;
}
