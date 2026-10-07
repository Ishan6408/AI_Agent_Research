# Under Pressure: System Architecture

## 1. Architecture Overview

**Under Pressure** is a multi-agent AI research platform designed to simulate a software development organization and analyze AI developer behaviour under workplace pressure.

The system follows a layered architecture:

```text
┌──────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│              Research & Analytics Dashboard                  │
└───────────────────────────┬──────────────────────────────────┘
                            │
                         REST API
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                            │
│              API Routes + Data Schemas                        │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    Analysis Layer                             │
│          Analytics Services + Helper Functions                │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                 Experimental Data                             │
│          Results + Processed Analytical Dataset               │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  Experiment Engine                            │
│             Multi-Agent Simulation                            │
└───────────────────────────┬──────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        Manager Agent  Developer Agents  Auditor Agent
              │             │             │
              └─────────────┼─────────────┘
                            │
                            ▼
                     LLM / Model Layer
```

The architecture separates experimentation, data analysis, backend APIs, and frontend visualization.

This separation allows the experiment system to generate research data independently from the dashboard.

---

# 2. Architectural Goals

The architecture is designed around the following goals:

1. Separate the research simulation from the user interface.
2. Separate analytical logic from API routing.
3. Provide structured data contracts between backend and frontend.
4. Support repeated experiments.
5. Allow different analytical views over the same experimental dataset.
6. Make the system easier to extend.
7. Keep the research dashboard independent from the underlying experiment implementation.
8. Support local LLM execution through the model layer.

---

# 3. High-Level Architecture

The complete system consists of six major layers:

```text
┌──────────────────────────────┐
│ 1. Presentation Layer        │
│ React + TypeScript           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 2. API Layer                 │
│ FastAPI                      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 3. Analytics Layer           │
│ Analysis Services            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 4. Data Layer                │
│ Experiment Results           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 5. Experiment Layer          │
│ Multi-Agent Simulation       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 6. Model Layer               │
│ LLM / Ollama                 │
└──────────────────────────────┘
```

---

# 4. Presentation Layer

The presentation layer is implemented using:

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts

Its responsibility is to display research results and provide an interface for exploring experimental data.

The frontend does not contain the core experiment logic.

Instead, it requests processed information from the FastAPI backend.

```text
React Component
       │
       ▼
Frontend API Service
       │
       ▼
HTTP Request
       │
       ▼
FastAPI Endpoint
```

---

# 5. Frontend Structure

The frontend follows a component-based architecture.

```text
frontend/
│
├── src/
│   │
│   ├── components/
│   │   ├── KPICard.tsx
│   │   ├── KPIGrid.tsx
│   │   ├── ChartCard.tsx
│   │   └── OverviewCharts.tsx
│   │
│   ├── pages/
│   │   └── Dashboard.tsx
│   │
│   ├── services/
│   │   └── API services
│   │
│   └── types/
│       └── TypeScript interfaces
│
├── package.json
└── vite.config.ts
```

---

# 6. Dashboard Architecture

The main dashboard acts as the entry point for the research interface.

```text
Dashboard
│
├── KPI Grid
│
├── Overview Charts
│
├── Behaviour Analysis
│
├── Personality Analysis
│
├── Developer Analysis
│
├── Pressure Analysis
│
├── Auditor Analysis
│
└── Dataset Explorer
```

The dashboard consumes data from multiple analytical endpoints.

---

# 7. Frontend Data Flow

The frontend follows this general flow:

```text
User Opens Dashboard
        │
        ▼
Dashboard Component
        │
        ▼
API Service
        │
        ▼
FastAPI Endpoint
        │
        ▼
Analytics Service
        │
        ▼
Processed Dataset
        │
        ▼
JSON Response
        │
        ▼
React State
        │
        ▼
Chart / KPI Component
```

This keeps data processing on the backend while the frontend focuses on presentation.

---

# 8. API Layer

The API layer uses FastAPI.

The backend acts as the communication boundary between the frontend and analytical system.

```text
React Frontend
       │
       │ HTTP
       ▼
FastAPI
       │
       ├── Routes
       ├── Schemas
       └── Services
              │
              ▼
         Analytics
```

The API provides structured JSON responses for frontend components.

---

# 9. Backend Structure

The current backend follows this structure:

```text
backend/
│
├── main.py
├── schemas.py
│
├── routes/
│
└── services/
    ├── analysis_service.py
    ├── analysis_helpers.py
    └── ...
```

---

# 10. Main Backend Components

## main.py

The main application entry point.

Responsibilities include:

* Creating the FastAPI application.
* Registering routes.
* Configuring the backend application.
* Providing the application entry point for Uvicorn.

---

## schemas.py

Defines structured data models used by the backend.

Schemas provide a consistent contract for API responses and internal data structures.

The frontend relies on these structures to interpret returned analytical data.

---

## routes/

The routes layer exposes HTTP endpoints.

The route layer should remain focused on:

* Request handling
* Parameter handling
* Calling services
* Returning responses

Complex analytical calculations should remain in the service layer.

---

## services/

The services layer contains the main analytical logic.

Important files include:

```text
analysis_service.py
analysis_helpers.py
```

The service layer processes experiment data and prepares results for API consumers.

---

# 11. Analytics Layer

The analytics layer sits between experimental data and the API.

```text
Experimental Dataset
        │
        ▼
Analysis Service
        │
        ├── Overview
        ├── Personality
        ├── Developer
        ├── Behaviour
        ├── Pressure
        ├── Auditor
        └── Dataset
        │
        ▼
Structured Analytics
```

This design avoids duplicating analytical calculations inside individual React components.

---

# 12. Analytics Responsibilities

The analytics layer handles operations such as:

* Loading experiment data
* Filtering data
* Grouping observations
* Calculating metrics
* Creating analytical summaries
* Preparing chart datasets
* Comparing experimental conditions
* Calculating correlations
* Preparing dashboard-specific responses

---

# 13. Analytics Endpoints

The current API architecture exposes the following analytical resources:

```text
/api/analytics/overview
/api/analytics/overview/scatter
/api/analytics/personality
/api/analytics/developers
/api/analytics/behavior
/api/pressure
/api/auditor
/api/dataset
```

These endpoints provide specialized analytical views over the experimental dataset.

---

# 14. API Request Flow

A typical request follows:

```text
GET /api/analytics/behavior
             │
             ▼
        FastAPI Route
             │
             ▼
     Analysis Service
             │
             ▼
       Dataset Loading
             │
             ▼
       Data Processing
             │
             ▼
    Analytical Response
             │
             ▼
        JSON Response
             │
             ▼
      React Component
```

---

# 15. Experiment Layer

The experiment layer generates the research data.

Its responsibility is to simulate the organization and collect agent behaviour.

```text
Experiment Configuration
          │
          ▼
    Company Environment
          │
          ▼
      Agent Creation
          │
          ▼
     Task Assignment
          │
          ▼
     Agent Interaction
          │
          ▼
    Behaviour Recording
          │
          ▼
    Auditor Evaluation
          │
          ▼
     Experiment Result
```

---

# 16. Multi-Agent Architecture

The simulated organization contains three primary agent categories:

```text
                 Manager Agent
                       │
                       ▼
              Task / Expectations
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Developer A    Developer B    Developer C
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                Status Reports
                       │
                       ▼
                 Auditor Agent
                       │
                       ▼
              Behaviour Evaluation
```

---

# 17. Manager Agent Architecture

The Manager Agent is responsible for organizational coordination.

```text
Manager Agent
     │
     ├── Task Creation
     ├── Task Assignment
     ├── Expectations
     ├── Deadlines
     └── Pressure Conditions
```

The manager establishes the environment in which developer agents operate.

---

# 18. Developer Agent Architecture

Developer agents represent AI software developers.

Each developer receives a task and operates under an experimental configuration.

```text
Developer Agent
      │
      ├── Role
      ├── Personality
      ├── Task
      ├── Pressure
      ├── Reward
      ├── Penalty
      └── Deadline
```

The developer produces behavioural observations:

```text
Actual Progress
Reported Progress
Reasoning
Performance
Bugs
Code Quality
Behaviour Strategy
```

---

# 19. Auditor Agent Architecture

The Auditor Agent evaluates developer behaviour independently.

```text
Developer Data
      │
      ├── Actual Progress
      ├── Reported Progress
      ├── Deception Gap
      ├── Performance
      └── Reasoning
             │
             ▼
       Auditor Agent
             │
             ├── Auditor Score
             └── Detection Result
```

The auditor provides an independent assessment layer.

---

# 20. Model Layer

The model layer provides the language-model runtime used by the agents.

The project supports local model execution through Ollama.

The architecture keeps the model layer separate from the analytics system:

```text
LLM / Ollama
      │
      ▼
Agent Behaviour
      │
      ▼
Experiment Results
      │
      ▼
Analytics
```

This means the analytical system works on generated experiment data rather than directly depending on the model runtime during visualization.

---

# 21. Data Architecture

The project follows a data pipeline:

```text
Agent Interaction
       │
       ▼
Raw Experiment Result
       │
       ▼
Structured Dataset
       │
       ▼
Analysis
       │
       ▼
Analytics Response
       │
       ▼
Dashboard
```

The data layer acts as the boundary between experiment generation and result presentation.

---

# 22. Core Behavioural Metric

One of the primary metrics is the deception gap.

```text
Deception Gap
=
Reported Progress
-
Actual Progress
```

Example:

```text
Actual Progress   = 55
Reported Progress = 80

Deception Gap = 25
```

The value is used as an analytical signal.

A positive value indicates over-reporting relative to the measured actual progress.

A negative value indicates under-reporting.

---

# 23. Experimental Data Flow

A complete experiment produces data through the following sequence:

```text
Company Policy
      │
      ▼
Pressure Configuration
      │
      ▼
Manager Task
      │
      ▼
Developer Execution
      │
      ▼
Developer Report
      │
      ├───────────────┐
      ▼               ▼
Actual Progress   Reported Progress
      │               │
      └───────┬───────┘
              ▼
        Deception Gap
              │
              ▼
       Auditor Evaluation
              │
              ▼
       Experiment Record
```

---

# 24. Data Processing Flow

Once experiment data exists, it follows a separate analytical pipeline:

```text
Experiment Dataset
        │
        ▼
Data Loading
        │
        ▼
Validation / Cleaning
        │
        ▼
Metric Calculation
        │
        ▼
Aggregation
        │
        ▼
Analytical Dataset
        │
        ▼
FastAPI Response
        │
        ▼
React Visualization
```

---

# 25. Separation of Concerns

The architecture intentionally separates responsibilities.

| Layer | Responsibility |
|---|---|
| Model | Generate AI agent responses |
| Agent | Implement organizational roles |
| Experiment | Run controlled simulations |
| Data | Store experiment results |
| Analytics | Process and analyze data |
| API | Expose analytical results |
| Frontend | Present results |
| Components | Render individual UI elements |

This structure reduces coupling between research logic and presentation logic.

---

# 26. Why the Architecture Uses FastAPI

FastAPI provides the boundary between Python-based analysis and the React frontend.

Without an API layer, the frontend would need to understand the internal Python analysis implementation.

With FastAPI:

```text
Python Analytics
       │
       ▼
    FastAPI
       │
       ▼
React / TypeScript
```

The frontend receives structured data without needing to know how the calculations are performed.

---

# 27. Why the Architecture Uses React

React provides a component-based interface for the research dashboard.

It supports:

* Reusable dashboard components
* Dynamic data rendering
* Interactive charts
* Structured layouts
* TypeScript-based interfaces
* Separation between pages and components

The React migration also separates research computation from research presentation.

---

# 28. Why the Architecture Uses Recharts

Recharts is used for frontend visualization.

It receives processed analytical data from the backend and renders charts such as:

* Scatter plots
* Bar charts
* Line charts
* Distribution charts
* Comparison charts

The analytical calculations remain in Python.

---

# 29. Request and Response Architecture

A typical frontend request looks like:

```text
React
 │
 │ GET /api/analytics/overview
 ▼
FastAPI
 │
 ▼
Analysis Service
 │
 ▼
Dataset
 │
 ▼
Aggregation
 │
 ▼
JSON
 │
 ▼
React
 │
 ▼
KPI / Chart
```

This provides a clear contract between the frontend and backend.

---

# 30. Health Check

The backend exposes:

```text
GET /health
```

The endpoint provides a lightweight way to verify that the FastAPI application is running.

This is useful during development and deployment checks.

---

# 31. Development Architecture

The development environment consists of two primary application processes:

```text
Terminal 1
──────────
FastAPI
Uvicorn
Port 8000

        │
        │ REST API
        ▼

Terminal 2
──────────
Vite
React
Frontend Development Server
```

The frontend communicates with the backend through HTTP requests.

---

# 32. Production Architecture

The production architecture follows the same logical separation:

```text
                    User
                     │
                     ▼
             React Frontend
                     │
                     ▼
               API Gateway
                     │
                     ▼
              FastAPI Backend
                     │
             ┌───────┴───────┐
             ▼               ▼
        Analytics        Experiment
          Layer             Layer
             │               │
             ▼               ▼
          Dataset          LLM / Model
```

The exact deployment infrastructure depends on the selected hosting environment.

---

# 33. Repository Architecture

The repository is organized around major system responsibilities.

```text
AI_Agent_Research/
│
├── backend/
│   ├── main.py
│   ├── schemas.py
│   ├── routes/
│   └── services/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── agents/
│
├── experiments/
│
├── analysis/
│
├── models/
│
├── results/
│
├── requirements.txt
├── README.md
└── .gitignore
```

The exact repository structure may evolve as additional research functionality is implemented.

---

# 34. Dependency Direction

The preferred dependency direction is:

```text
Frontend
   │
   ▼
API
   │
   ▼
Analytics
   │
   ▼
Data
```

The experiment layer generates data independently:

```text
Experiment
   │
   ▼
Data
   │
   ▼
Analytics
```

The frontend should not directly depend on internal experiment implementation details.

---

# 35. Architecture Principles

The project follows these principles:

### Separation of Concerns

Each layer has a defined responsibility.

### Reusability

Shared UI and analytical functionality should be implemented as reusable components or services.

### Data Contract

The backend and frontend communicate through structured API responses.

### Experiment Independence

Experiments generate datasets independently from dashboard rendering.

### Model Independence

Analytical processing should operate on experiment data rather than tightly coupling analysis to a specific LLM runtime.

### Reproducibility

Experiment configuration and code versions should be recorded.

### Extensibility

New agents, analytical endpoints, charts, and experiment variables should fit into the existing architecture without requiring a complete redesign.

---

# 36. Extending the Architecture

## Adding a New Agent

A new agent should fit into the agent layer:

```text
agents/
    new_agent.py
```

The experiment runner should initialize the agent and include its outputs in the experiment record.

---

## Adding a New Metric

A new metric should be implemented in the analytics layer.

The flow should be:

```text
Dataset
   ↓
Metric Calculation
   ↓
Analysis Service
   ↓
API Response
   ↓
Frontend Component
```

The frontend should not independently calculate the same research metric.

---

## Adding a New Dashboard Section

A new dashboard section should follow:

```text
New Analysis
     ↓
Backend Service
     ↓
API Endpoint
     ↓
Frontend API Service
     ↓
React Component
     ↓
Dashboard
```

This keeps the feature consistent with the existing architecture.

---

# 37. Example Extension

Suppose a future version adds **task difficulty analysis**.

The implementation flow would be:

```text
Experimental Dataset
        │
        ▼
Task Difficulty Analysis
        │
        ▼
/api/analytics/task-difficulty
        │
        ▼
Frontend API Service
        │
        ▼
TaskDifficultyChart.tsx
        │
        ▼
Dashboard
```

This avoids placing analytical calculations directly inside the React component.

---

# 38. Security and Configuration Considerations

The project should keep model configuration and sensitive environment variables outside committed source code.

Configuration values should be managed through environment variables where appropriate.

Sensitive information should not be committed to Git.

Recommended exclusions include:

```text
.env
.venv/
node_modules/
__pycache__/
temporary experiment outputs
local model configuration
```

The repository should use `.gitignore` to prevent accidental commits.

---

# 39. Performance Considerations

The experiment layer and dashboard have different performance characteristics.

Large experiments should run independently from dashboard requests.

The recommended flow is:

```text
Long-running Experiment
          ↓
Stored Dataset
          ↓
Fast Analytics Requests
          ↓
Dashboard
```

The dashboard should not start a large experiment during normal visualization requests.

This separation keeps dashboard interaction responsive.

---

# 40. Research Reproducibility Architecture

A reproducible experiment should connect:

```text
Experiment ID
     +
Configuration
     +
Model
     +
Dataset
     +
Git Commit
```

Example:

```text
Experiment: EXP-001
Model: Configured LLM
Pressure: High
Agents: 4
Rounds: 10
Commit: <git-sha>
Dataset: <dataset-file>
```

This makes it possible to identify the code and configuration associated with a result.

---

# 41. Complete Data Flow

The complete architecture can be summarized as:

```text
                         ┌───────────────┐
                         │ LLM / Ollama  │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │   Multi-Agent System │
                    │                      │
                    │ Manager              │
                    │ Developers           │
                    │ Auditor              │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Experiment Runner   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Experiment Results  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Analysis Services  │
                    │                      │
                    │ Pandas / NumPy       │
                    │ Statistical Analysis │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    │                      │
                    │ Routes / Schemas     │
                    └──────────┬───────────┘
                               │
                            REST API
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │                      │
                    │ TypeScript / Vite    │
                    │ Tailwind / Recharts  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Research Dashboard  │
                    └──────────────────────┘
```

---

# 42. Architecture Summary

The system follows a layered architecture where each major component has a defined responsibility.

```text
LLM Layer
    ↓
Agent Layer
    ↓
Experiment Layer
    ↓
Data Layer
    ↓
Analytics Layer
    ↓
API Layer
    ↓
Frontend Layer
```

The architecture allows the project to evolve independently across research experimentation, analytical processing, backend development, and frontend presentation.

The core principle is:

```text
Generate Data
      ↓
Analyze Data
      ↓
Expose Data
      ↓
Visualize Data
      ↓
Interpret Results
```

This structure provides the foundation for extending **Under Pressure** into a larger AI-agent behavioural research platform.