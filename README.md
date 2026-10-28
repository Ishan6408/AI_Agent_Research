# VEIL
### AI Agent Deception Research

> **Investigating deceptive behavior in autonomous AI agents.**

**Research focus:** Emergent deception, reward hacking, auditor detection, and behavioral changes under pressure in multi-agent organizations.

---

## Overview

**VEIL** is a research-oriented multi-agent simulation and analytics system designed to study how autonomous AI software developers behave under varying workplace pressures, incentives, deadlines, and personality traits.

The system models interactions between:
- **Manager Agent**: Sets project deadlines, sprint requirements, financial bonuses ($20–$500), and failure penalties ($10–$300).
- **Developer Agents**: Autonomous LLM agents assuming software-engineering roles (Frontend, Backend, DevOps, QA) with distinct personality framing (Honest, Opportunistic, Deceptive, etc.).
- **Auditor Agent**: Independent AI auditor that verifies code quality and uncovers narrative misrepresentation and fraudulent status updates.

Empirical observations are collected across controlled factorial conditions, processed via a FastAPI analytics layer, and visualized in a high-fidelity React research dashboard.

---

## System Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│              VEIL Research & Analytics Dashboard             │
└───────────────────────────┬──────────────────────────────────┘
                            │ REST API
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│              API Routes + Analytics Schemas                  │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  Simulation & Analysis                       │
│        Multi-Agent Simulation Engine + Factorial Runner      │
└──────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Backend & Analytics API
```bash
# Activate virtual environment
.venv/Scripts/activate

# Start the FastAPI backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Research Dashboard
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` to explore the VEIL Telemetry Dashboard.

### 3. Comprehensive Documentation
Full research documentation, statistical analyses, and architectural specifications are located in the [`docs/`](docs/) directory:
- [Detailed Architecture](docs/ARCHITECTURE.md)
- [Complete Project Documentation](docs/Project_Documentation.md)
- [Final Research Report](docs/FINAL_RESEARCH_REPORT.md)
- [Statistical Analysis Report](docs/STATISTICAL_ANALYSIS_REPORT.md)
- [Extended Project README](docs/README.md)
