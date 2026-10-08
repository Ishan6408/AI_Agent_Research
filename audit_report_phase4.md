# Data Integrity Audit Report

## A. REAL AND CORRECT
- **Dashboard.tsx**: Uses `AnalyticsOverview`, `OverviewScatterPoint`, and `GroupAnalysisRow` fetched directly from the backend API.
- **Reports.tsx**: Relies on `AnalyticsOverview`, `CorrelationResponse`, `ResearchFindings`, and `SuspiciousExperiment` from the backend API.
- **BehaviourAnalysis.tsx**: Utilizes `DatasetRecord[]` and `GroupAnalysisRow[]` from the API for rendering scatter plots and bar charts.
- **MainLayout.tsx**: Displays dynamic model info (e.g. name, runtime, params) and active records/agents count fetched natively from `/api/system/model` and `/api/dataset/summary`.
- **ExperimentDetail.tsx**: Fetches an individual experiment directly from `/api/experiments/:id`.

## B. HARDCODED
- **Dashboard.tsx**: `gap > 20` hardcoded for deception visualization colors (amber vs mint).
- **BehaviourAnalysis.tsx**: `gap > 20` hardcoded logic used to calculate `criticalCount`. 
- **Reports.tsx**: Hardcoded threshold `(overview.detection_rate_pct ?? 100) < 50`.

## C. MOCK
- **Dashboard.tsx**: Footer contains fake telemetry: `SYS_ID: 0x9F4A.2B // TELEMETRY_STREAM_OK`.

## D. STALE
- None explicitly identified beyond the UI mocking of status like `[OK]` or `[TRACKING]` which should map to actual data states if possible, but are largely atmospheric.

## E. FRONTEND CALCULATIONS
- **BehaviourAnalysis.tsx**: Calculates `avgGap`, `criticalCount`, `lowestHonesty`, and `lowestScore` manually in the frontend using the dataset array. It also manually calculates histogram `bins` for the Deception Gap Distribution. 

## F. MISSING API DATA
- **BehaviourAnalysis.tsx**: Needs explicit backend provision for `criticalCount`, `lowestHonesty`, and `lowestScore`. (Though `avgGap` is arguably available in `AnalyticsOverview.avg_deception_gap`). 

## G. BROKEN DATA CONNECTIONS
- None directly identified; endpoints seem properly mapped in `api.ts`, but fallbacks like `|| 'N/A'` are used extensively in `Reports.tsx` and `ExperimentDetail.tsx` when data should instead explicitly report `[NO_DATA]`.

## H. REMAINING INTENTIONAL HARDCODED VALUES
- **Reports.tsx**: The threshold < 50 for rendering an alert on Detection Rate is preserved as it acts as a styling configuration rather than a fake measurement.
