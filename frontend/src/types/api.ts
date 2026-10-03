// =============================================================================
// API Type Definitions — Phase 4A
// These types accurately represent the FastAPI response shapes.
// Do NOT add fake/placeholder data shapes here.
// Updated to match backend/services/* after Phase 4A contract fixes.
// =============================================================================


// ---------------------------------------------------------------------------
// Shared / primitive
// ---------------------------------------------------------------------------

/** All fields present in models/experiment.py ExperimentResult */
export interface ExperimentResult {
  // Task information
  task_name: string;

  // Environment
  pressure: string;
  developer_role: string;
  personality: string;
  task_difficulty: string;

  // Company policy
  reward: number;
  penalty: number;
  deadline_hours: number;

  // Developer behaviour
  behavior_strategy: string;
  actual_progress: number;
  reported_progress: number;
  deception_gap: number;

  // Engineering quality
  bugs_introduced: number;
  code_quality: number;

  // Behaviour metrics
  honesty_score: number;
  stress_index: number;
  performance_score: number;

  deception_level: string | null;
  developer_reasoning: string;
  manager_message: string;

  // Auditor result
  auditor_score: number;
  deception_detected: boolean;
  auditor_explanation: string;

  /** Stable identifier derived from the JSON filename (JSON-backed only). */
  id?: string;
}

/** Backward-compatible alias used by Phase 3 placeholders */
export interface Experiment extends ExperimentResult {
  // ExperimentResult already covers everything; this alias keeps
  // existing Phase 3 hook imports compiling.
}


// ---------------------------------------------------------------------------
// Request bodies
// ---------------------------------------------------------------------------

export interface RunPressureRequest {
  pressure: string;
  runs?: number;
  base_seed?: number;
}

export interface RunAllRequest {
  runs?: number;
  base_seed?: number;
}

export interface RunExperimentRequest {
  pressure: string;
  base_seed?: number;
}

export interface RunExperimentResponse {
  success: boolean;
  experiment_id: string;
  result: ExperimentResult;
  experiments?: ExperimentResult[];
}

export interface RunBatchResponse {
  success: boolean;
  count: number;
  experiments?: ExperimentResult[];
}


// ---------------------------------------------------------------------------
// Agents  →  GET /api/agents, GET /api/agents/{role}
// ---------------------------------------------------------------------------

export interface AgentResponse {
  name: string;
  role: string;
  personality_options: string[];
  behaviour_strategies: string[];
  responsibilities: string[];
  metrics?: {
    avg_deception_gap?: number | null;
    avg_performance_score?: number | null;
    avg_bugs_introduced?: number | null;
  };
}


// ---------------------------------------------------------------------------
// Dataset  →  GET /api/dataset, GET /api/dataset/summary
// ---------------------------------------------------------------------------

/** A single row of GET /api/dataset — same shape as ExperimentResult */
export type DatasetRecord = ExperimentResult;

/**
 * GET /api/dataset/summary
 * Matches the KPI header in analysis/dashboard.py
 */
export interface DatasetSummary {
  total_experiments: number;
  avg_actual_progress?: number | null;
  avg_reported_progress?: number | null;
  avg_deception_gap?: number | null;
  avg_bugs_introduced?: number | null;
  avg_code_quality?: number | null;
  avg_honesty_score?: number | null;
  avg_stress_index?: number | null;
  avg_performance_score?: number | null;
  avg_auditor_score?: number | null;
  /** 0-1 fraction */
  detection_rate?: number | null;
  /** Detection rate as a percentage (0-100) */
  detection_rate_pct?: number | null;
  columns?: string[];
  column_count?: number;
  missing_values?: number;
}


// ---------------------------------------------------------------------------
// Analytics  →  GET /api/analytics/*
// ---------------------------------------------------------------------------

/**
 * GET /api/analytics/overview
 * KPI metrics + distribution breakdowns
 */
export interface AnalyticsOverview {
  total_experiments: number;
  avg_actual_progress?: number | null;
  avg_reported_progress?: number | null;
  avg_deception_gap?: number | null;
  avg_bugs_introduced?: number | null;
  avg_code_quality?: number | null;
  avg_honesty_score?: number | null;
  avg_stress_index?: number | null;
  avg_performance_score?: number | null;
  avg_auditor_score?: number | null;
  /** 0-1 fraction */
  detection_rate?: number | null;
  /** Detection rate as a percentage (0-100) */
  detection_rate_pct?: number | null;
  pressure_distribution?: Record<string, number>;
  personality_distribution?: Record<string, number>;
  behavior_strategy_distribution?: Record<string, number>;
  developer_role_distribution?: Record<string, number>;
  task_difficulty_distribution?: Record<string, number>;
  deception_level_distribution?: Record<string, number>;
}

export interface OverviewScatterPoint {
  stress_index: number;
  deception_gap: number;
  pressure?: string;
  personality?: string;
  developer_role?: string;
  deception_level?: string;
  performance_score?: number | null;
}

/**
 * One row from GET /api/analytics/pressure|personality|developers|behavior
 * Represents groupby mean of all numeric columns + a count.
 */
export interface GroupAnalysisRow {
  /** The groupby key value (e.g. "LOW", "HIGH", "OPTIMISTIC") */
  [groupKey: string]: string | number | null | undefined;
  count?: number;
  performance_score?: number | null;
  honesty_score?: number | null;
  stress_index?: number | null;
  deception_gap?: number | null;
  bugs_introduced?: number | null;
  code_quality?: number | null;
  auditor_score?: number | null;
  actual_progress?: number | null;
  reported_progress?: number | null;
  reward?: number | null;
  penalty?: number | null;
  deadline_hours?: number | null;
  deception_detected?: number | null;
}

/**
 * GET /api/analytics/correlation
 */
export interface CorrelationResponse {
  /** column-name → { column-name → coefficient } */
  matrix: Record<string, Record<string, number | null>>;
  columns: string[];
}

/**
 * One row from GET /api/analytics/suspicious
 * Top-10 by auditor_score descending (matches dashboard Correlation tab)
 */
export interface SuspiciousExperiment {
  developer_role?: string;
  task_name?: string;
  pressure?: string;
  personality?: string;
  behavior_strategy?: string;
  deception_gap?: number | null;
  auditor_score?: number | null;
  deception_detected?: boolean;
}

/** One histogram bucket from auditor_analysis.score_distribution */
export interface ScoreBucket {
  bucket: string;
  count: number;
}

/** One row from auditor_analysis.detection_by_pressure */
export interface DetectionByPressure {
  pressure: string;
  detection_rate_pct: number;
}

/** One row from auditor_analysis.score_by_pressure */
export interface ScoreByPressure {
  pressure: string;
  auditor_score: number;
}

/**
 * GET /api/analytics/auditor
 */
export interface AuditorAnalysis {
  overall_detection_rate: number;
  overall_avg_auditor_score: number;
  score_distribution?: ScoreBucket[];
  detection_by_pressure?: DetectionByPressure[];
  score_by_pressure?: ScoreByPressure[];
}

/**
 * GET /api/analytics/research-findings
 * Mirrors the "Research Findings" box in the Correlation tab
 */
export interface ResearchFindings {
  most_deceptive_personality?: string;
  personality_deception_means?: Record<string, number | null>;
  most_deceptive_developer?: string;
  developer_deception_means?: Record<string, number | null>;
  highest_deception_pressure?: string;
  pressure_deception_means?: Record<string, number | null>;
  average_metrics?: Record<string, number | null>;
}


// ---------------------------------------------------------------------------
// Auditor  →  GET /api/auditor/results, POST /api/auditor/audit
// ---------------------------------------------------------------------------

export interface AuditorResponse {
  score?: number | null;
  deception_detected?: boolean;
  explanation?: string;
  by_pressure?: Array<{
    pressure: string;
    auditor_score: number | null;
    deception_detected: number | null;
  }>;
}


// ---------------------------------------------------------------------------
// Health  →  GET /api/health
// ---------------------------------------------------------------------------

export interface HealthResponse {
  status: string;
}
