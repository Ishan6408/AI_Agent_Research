# Phase 4A — API Contract Mapping

> **Project:** Under Pressure — AI Agent Deception Research  
> **Phase:** 4A — API Contract Verification & Repair  
> **Date:** 2026-10-03  
> **Commit base:** `3a57567`  
> **Status:** ✅ PASS

---

## Streamlit Dashboard Feature → FastAPI Endpoint Mapping

| Streamlit Feature | Data Source | FastAPI Endpoint | Status |
|---|---|---|---|
| **KPI: Total Experiments** | `len(filtered)` | `GET /api/analytics/overview` → `total_experiments` | ✅ PASS |
| **KPI: Average Performance** | `mean(performance_score)` | `GET /api/analytics/overview` → `avg_performance_score` | ✅ PASS |
| **KPI: Average Honesty** | `mean(honesty_score)` | `GET /api/analytics/overview` → `avg_honesty_score` | ✅ PASS |
| **KPI: Detection Rate** | `safe_percentage(deception_detected)` | `GET /api/analytics/overview` → `detection_rate_pct` | ✅ PASS (was missing `_pct`) |
| **KPI: Average Bugs** | `mean(bugs_introduced)` | `GET /api/analytics/overview` → `avg_bugs_introduced` | ✅ PASS |
| **KPI: Average Code Quality** | `mean(code_quality)` | `GET /api/analytics/overview` → `avg_code_quality` | ✅ PASS |
| **KPI: Average Stress** | `mean(stress_index)` | `GET /api/analytics/overview` → `avg_stress_index` | ✅ PASS |
| **KPI: Average Auditor Score** | `mean(auditor_score)` | `GET /api/analytics/overview` → `avg_auditor_score` | ✅ PASS |
| **Sidebar: Pressure filter** | `df.pressure.unique()` | `GET /api/dataset?pressure=X` | ✅ PASS |
| **Sidebar: Personality filter** | `df.personality.unique()` | `GET /api/dataset?personality=X` | ✅ PASS |
| **Sidebar: Task Difficulty filter** | `df.task_difficulty.unique()` | `GET /api/dataset?task_difficulty=X` | ✅ PASS |
| **Sidebar: Behaviour Strategy filter** | `df.behavior_strategy.unique()` | `GET /api/dataset?behavior_strategy=X` | ✅ PASS |
| **Sidebar: Developer Role filter** | `df.developer_role.unique()` | `GET /api/dataset?developer_role=X` | ✅ PASS |
| **Overview: Stress vs Deception Gap scatter** | `stress_index`, `deception_gap`, `personality`, `performance_score` | `GET /api/dataset` (full records) | ✅ PASS |
| **Overview: Pressure Distribution histogram** | `pressure` value counts | `GET /api/analytics/overview` → `pressure_distribution` | ✅ PASS (added) |
| **Overview: Behaviour Strategy Distribution histogram** | `behavior_strategy` value counts | `GET /api/analytics/overview` → `behavior_strategy_distribution` | ✅ PASS (added) |
| **Overview: Deception Detection pie chart** | `deception_detected` value counts | `GET /api/analytics/overview` → `detection_rate_pct` | ✅ PASS |
| **Behaviour: Actual vs Reported Progress scatter** | `actual_progress`, `reported_progress`, `deception_gap` | `GET /api/dataset` | ✅ PASS |
| **Behaviour: Performance by Personality bar** | `groupby(personality)[performance_score].mean()` | `GET /api/analytics/personality` | ✅ PASS |
| **Behaviour: Honesty by Personality bar** | `groupby(personality)[honesty_score].mean()` | `GET /api/analytics/personality` | ✅ PASS |
| **Behaviour: Stress vs Deception Gap scatter** | All fields | `GET /api/dataset` | ✅ PASS |
| **Behaviour: Deception Gap Distribution histogram** | `deception_gap` | `GET /api/dataset` | ✅ PASS |
| **Developer: Bugs by Developer Role bar** | `groupby(developer_role)[bugs_introduced].mean()` | `GET /api/analytics/developers` | ✅ PASS |
| **Developer: Code Quality by Developer Role bar** | `groupby(developer_role)[code_quality].mean()` | `GET /api/analytics/developers` | ✅ PASS |
| **Developer: Pressure vs Bugs bar** | `groupby(pressure)[bugs_introduced].mean()` | `GET /api/analytics/pressure` | ✅ PASS |
| **Developer: Avg Performance by Developer bar** | `groupby(developer_role)[performance_score].mean()` | `GET /api/analytics/developers` | ✅ PASS |
| **Developer: Developer Comparison table** | `groupby(developer_role)[metrics].mean()` | `GET /api/analytics/developers` | ✅ PASS |
| **Auditor: Auditor Score Distribution histogram** | `auditor_score` bins | `GET /api/analytics/auditor` → `score_distribution` | ✅ PASS (added) |
| **Auditor: Detection Rate by Pressure bar** | `groupby(pressure)[deception_detected].mean()*100` | `GET /api/analytics/auditor` → `detection_by_pressure` | ✅ PASS (added) |
| **Auditor: Avg Auditor Score by Pressure bar** | `groupby(pressure)[auditor_score].mean()` | `GET /api/analytics/auditor` → `score_by_pressure` | ✅ PASS (added) |
| **Correlation: Correlation Heatmap** | `numeric_df.corr()` | `GET /api/analytics/correlation` → `{matrix, columns}` | ✅ PASS |
| **Correlation: Top 10 Suspicious Experiments table** | Sort by `auditor_score` DESC, head(10) | `GET /api/analytics/suspicious` | ✅ PASS (was sorting by `deception_gap` — fixed) |
| **Correlation: Research Findings — Most Deceptive Personality** | `groupby(personality)[deception_gap].mean().idxmax()` | `GET /api/analytics/research-findings` → `most_deceptive_personality` | ✅ PASS (added endpoint) |
| **Correlation: Research Findings — Most Deceptive Developer** | `groupby(developer_role)[deception_gap].mean().idxmax()` | `GET /api/analytics/research-findings` → `most_deceptive_developer` | ✅ PASS (added endpoint) |
| **Correlation: Research Findings — Highest Deception Pressure** | `groupby(pressure)[deception_gap].mean().idxmax()` | `GET /api/analytics/research-findings` → `highest_deception_pressure` | ✅ PASS (added endpoint) |
| **Correlation: Average Metrics bar chart** | `mean()` of 7 numeric cols | `GET /api/analytics/research-findings` → `average_metrics` | ✅ PASS (added) |
| **Dataset Explorer: Full table** | `filtered` DataFrame | `GET /api/dataset` | ✅ PASS |
| **Dataset Explorer: CSV Download** | `filtered.to_csv()` | `GET /api/dataset/export` | ✅ PASS |
| **Dataset Explorer: Dataset Information table** | `columns`, `dtypes`, `isna().sum()` | `GET /api/dataset/summary` → `{columns, column_count, missing_values}` | ✅ PASS (added) |
| **Dataset Explorer: Dataset Shape** | `shape[0]`, `shape[1]`, `isna().sum().sum()` | `GET /api/dataset/summary` → `{total_experiments, column_count, missing_values}` | ✅ PASS |

---

## Endpoint Reference

| Endpoint | Route | Service | Schema | Notes |
|---|---|---|---|---|
| `GET /api/health` | `main.py` | — | — | ✅ |
| `GET /api/experiments` | `routes/experiments.py` | `experiment_service` | — | ✅ Returns `[]` when no JSON files |
| `GET /api/experiments/{id}` | `routes/experiments.py` | `experiment_service` | — | ✅ 404 on missing |
| `POST /api/experiments/run` | `routes/experiments.py` | `experiment_service` | `RunExperimentRequest` | ✅ |
| `POST /api/experiments/run-pressure` | `routes/experiments.py` | `experiment_service` | `RunPressureRequest` | ✅ |
| `POST /api/experiments/run-all` | `routes/experiments.py` | `experiment_service` | `RunAllRequest` | ✅ |
| `GET /api/dataset` | `routes/dataset.py` | `dataset_service` | — | ✅ 211 records, filterable |
| `GET /api/dataset/summary` | `routes/dataset.py` | `dataset_service` | — | ✅ |
| `GET /api/dataset/export` | `routes/dataset.py` | `dataset_service` | — | ✅ Streaming CSV |
| `GET /api/analytics/overview` | `routes/analytics.py` | `analytics_service` | — | ✅ |
| `GET /api/analytics/pressure` | `routes/analytics.py` | `analytics_service` | — | ✅ |
| `GET /api/analytics/personality` | `routes/analytics.py` | `analytics_service` | — | ✅ |
| `GET /api/analytics/developers` | `routes/analytics.py` | `analytics_service` | — | ✅ |
| `GET /api/analytics/behavior` | `routes/analytics.py` | `analytics_service` | — | ✅ |
| `GET /api/analytics/correlation` | `routes/analytics.py` | `analytics_service` | — | ✅ |
| `GET /api/analytics/suspicious` | `routes/analytics.py` | `analytics_service` | — | ✅ |
| `GET /api/analytics/auditor` | `routes/analytics.py` | `analytics_service` | — | ✅ |
| `GET /api/analytics/research-findings` | `routes/analytics.py` | `analytics_service` | — | ✅ New |
| `GET /api/agents` | `routes/agents.py` | `agent_service` | `AgentResponse` | ✅ |
| `GET /api/agents/{role}` | `routes/agents.py` | `agent_service` | `AgentResponse` | ✅ |
| `GET /api/auditor/results` | `routes/auditor.py` | `auditor_service` | — | ✅ |
| `POST /api/auditor/audit` | `routes/auditor.py` | `auditor_service` | — | ✅ |
