# UI Migration Checklist

This document tracks the migration of features from the current Streamlit + Python implementation to the modern React + FastAPI architecture.

## Phase 1 — Baseline
- [x] Complete repository audit and structure mapping
- [x] Document current data model and experiment storage
- [x] Identify deterministic vs LLM logic
- [x] Document auditor scoring system
- [x] Inventory all dashboard features
- [x] Document bugs and schema mismatches (e.g., `dashboard/app.py` vs JSON output)

## Phase 2 — FastAPI Backend
- [ ] Initialize FastAPI project structure
- [ ] Migrate `models/*.py` to FastAPI schemas (Pydantic is already used)
- [ ] Clean up dead code (unused models, unused imports)
- [ ] Create endpoint `GET /experiments` to fetch stored `results/*.json`
- [ ] Create endpoint `GET /experiments/summary` to replace `analyzer.py` output
- [ ] Create endpoint `POST /simulation/run` to trigger `ExperimentRunner.run_all`

## Phase 3 — React UI Foundation
- [ ] Initialize React + Vite + TypeScript project
- [ ] Setup Tailwind CSS
- [ ] Setup routing and base layout (Sidebar, Navbar)
- [ ] Implement data fetching hooks to connect to FastAPI

## Phase 4 — Dashboard
- [ ] Migrate Overall Statistics Metrics from `analysis/dashboard.py`
- [ ] Migrate Data Filters (Pressure, Role, Personality, etc.)
- [ ] Fix enum mismatch (e.g. `EXTREME` instead of `IMPOSSIBLE`)
- [ ] Implement robust auto-refresh polling (replacing `time.sleep`)
- [ ] Fix data schema mismatch to render Specific Experiment View properly

## Phase 5 — Experiment Controls
- [ ] Implement UI to trigger new simulations
- [ ] Show real-time progress of running simulations
- [ ] Allow selection of specific pressure levels or runs
- [ ] Visualize Agent Architecture (from `dashboard/app.py` tab 3)

## Phase 6 — Agents + Auditor
- [ ] Connect LLM backend properly, resolving the empty dict exception bug in `simulator.py`
- [ ] Remove duplicate simulation files (`bug_generator.py`, `code_quality.py`) and streamline agent classes
- [ ] Visualize Developer Reasoning and Manager Message per experiment in the UI
- [ ] Render Auditor Explanation and Score breakdown gauge

## Phase 7 — Analytics + Dataset
- [ ] Migrate Performance vs Pressure Plot (Recharts/Plotly)
- [ ] Migrate Behaviour Analysis Plots
- [ ] Migrate Developer Role Analysis
- [ ] Migrate Auditor Score Analysis
- [ ] Migrate Correlation Matrix / Heatmap

## Phase 8 — Reports
- [ ] Migrate Raw Dataset Explorer table view
- [ ] Implement CSV download capability from the React frontend
- [ ] Add printable report generation for research findings

## Phase 9 — Integration Testing
- [ ] Validate end-to-end data flow (React UI -> FastAPI -> Simulation -> JSON -> React)
- [ ] Verify Deception calculations remain perfectly matched with Phase 1 baseline
- [ ] Verify Auditor scores remain perfectly matched with Phase 1 baseline
- [ ] Ensure robust error handling for Ollama unavailability
