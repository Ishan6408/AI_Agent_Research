# Under Pressure: Project Documentation

## 1. Project Overview

**Under Pressure** is a research-oriented multi-agent simulation platform designed to study deceptive behaviour in AI software developers under workplace pressure.

The project models a simulated software development organization containing:

* Manager Agent
* Developer Agents
* Auditor Agent

The system creates controlled workplace conditions involving pressure, rewards, penalties, deadlines, task difficulty, and personality characteristics.

Developer agents perform simulated software-development tasks and report their progress. The system compares reported progress with actual progress and generates behavioural metrics such as deception gap, stress, performance, honesty, bugs, and code quality.

An independent Auditor Agent evaluates developer behaviour and attempts to identify potentially deceptive reports.

The resulting experimental data is processed through a Python analytics layer and exposed through a FastAPI backend. A React and TypeScript frontend presents the results through an interactive research dashboard.

---

# 2. Research Context

AI agents are increasingly being used for tasks that require planning, decision-making, communication, and software development.

An important research problem is understanding how these agents behave when their objectives conflict with environmental constraints.

The project studies a simulated workplace where developers must balance:

* Task completion
* Performance expectations
* Deadlines
* Rewards
* Penalties
* Workplace pressure
* Personal behavioural tendencies

The central research idea is to observe whether changes in these conditions correspond with changes in reported behaviour.

The project does not treat a discrepancy between reported and actual progress as definitive proof of intentional deception. Instead, it treats the discrepancy as an experimental signal for potentially deceptive reporting behaviour.

---

# 3. Research Question

The primary research question is:

> Do AI software developers exhibit deceptive behaviour when exposed to increasing levels of workplace pressure?

The project also investigates related questions:

### RQ1

Does workplace pressure influence the difference between actual and reported progress?

### RQ2

Does agent personality influence deceptive behaviour?

### RQ3

Does increased pressure affect developer performance?

### RQ4

Does increased pressure affect stress and software quality?

### RQ5

How effectively does an Auditor Agent identify potentially deceptive behaviour?

### RQ6

Which experimental variables show the strongest relationship with deception-related behaviour?

---

# 4. Research Objectives

The project has the following objectives:

1. Build a controlled multi-agent software-company simulation.
2. Represent different organizational roles using AI agents.
3. Introduce configurable workplace pressure.
4. Simulate software-development tasks.
5. Record actual and reported developer progress.
6. Calculate behavioural differences between actual and reported progress.
7. Evaluate developer behaviour using an independent Auditor Agent.
8. Generate structured experimental datasets.
9. Analyze relationships between experimental variables.
10. Expose analytical results through a backend API.
11. Provide an interactive research dashboard.
12. Support repeated experiments under controlled configurations.

---

# 5. High-Level System

The system consists of several logical layers:

```text
                    Research Configuration
                             │
                             ▼
                    Experiment Runner
                             │
                             ▼
                     Company Environment
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
        Manager Agent   Developer Agents   Policies
             │               │               │
             └───────────────┼───────────────┘
                             │
                             ▼
                     Developer Reports
                             │
                             ▼
                      Auditor Agent
                             │
                             ▼
                    Experiment Results
                             │
                             ▼
                     Analysis Pipeline
                             │
                             ▼
                    FastAPI Analytics API
                             │
                             ▼
                     React Dashboard
```

---

# 6. System Components

## 6.1 Experiment Runner

The experiment runner controls the execution of experiments.

Its responsibilities include:

* Creating experiment configurations
* Initializing agents
* Setting pressure conditions
* Creating tasks
* Assigning developers
* Running agent interactions
* Collecting results
* Saving experiment output

The experiment runner acts as the entry point for generating research data.

---

# 7. Company Environment

The simulated company provides the environment in which agents operate.

The environment defines organizational conditions such as:

* Pressure
* Reward
* Penalty
* Deadline
* Task expectations
* Performance requirements

These conditions provide the independent variables for the experiments.

---

# 8. Manager Agent

The Manager Agent represents a project manager within the simulated organization.

## Responsibilities

The Manager Agent:

* Creates or receives software-development tasks.
* Assigns tasks to developer agents.
* Communicates expectations.
* Provides task context.
* Applies organizational policies.
* Communicates deadlines and performance expectations.
* Interacts with developer agents.

The manager establishes the organizational environment in which developers make decisions.

---

# 9. Developer Agents

Developer Agents represent AI software developers.

Multiple developer configurations can be used within the experiment.

Each developer operates according to experimental parameters such as:

* Developer role
* Personality
* Task difficulty
* Pressure
* Reward
* Penalty
* Deadline
* Behaviour strategy

Developer agents produce experimental observations including:

* Actual progress
* Reported progress
* Reasoning
* Bugs
* Code quality
* Performance
* Status information
* Behaviour strategy

---

# 10. Auditor Agent

The Auditor Agent provides an independent evaluation of developer behaviour.

The auditor receives experimental signals associated with developer activity and evaluates whether the reported behaviour appears suspicious.

Relevant information includes:

* Actual progress
* Reported progress
* Deception gap
* Performance
* Developer reasoning
* Other available behavioural signals

The auditor generates:

* Auditor score
* Deception detection result

The auditor therefore creates a second layer of evaluation beyond the developer's own report.

---

# 11. Behaviour Model

The primary behavioural signal is the difference between actual and reported progress.

## Deception Gap

```text
Deception Gap = Reported Progress - Actual Progress
```

Example:

```text
Actual Progress   = 60
Reported Progress = 85

Deception Gap = 85 - 60
               = 25
```

A positive value indicates that the developer reported more progress than the measured actual progress.

A negative value indicates that the developer reported less progress than the measured actual progress.

The project uses this metric as an indicator for potentially deceptive reporting.

---

# 12. Personality Model

Personality is treated as an experimental variable.

Different personality configurations allow the same organizational environment to be tested with different behavioural characteristics.

For example:

```text
Personality A
     │
     ├── Low Pressure
     │
     ├── Medium Pressure
     │
     └── High Pressure
```

The resulting behaviour can then be compared across pressure levels.

The same process can be repeated for other personalities.

This creates a factorial-style experimental structure where multiple variables can be compared.

---

# 13. Pressure Model

Pressure represents workplace demands placed on developer agents.

Pressure conditions influence factors such as:

* Deadlines
* Rewards
* Penalties
* Expected performance
* Stress
* Task urgency

The purpose of varying pressure is to observe whether behavioural outcomes change as environmental demands increase.

---

# 14. Experimental Variables

## Independent Variables

The project uses several experimental variables.

These include:

* Pressure level
* Developer personality
* Developer role
* Reward
* Penalty
* Deadline
* Task difficulty

## Dependent Variables

The system measures:

* Actual progress
* Reported progress
* Deception gap
* Stress
* Performance
* Bugs
* Code quality
* Honesty
* Auditor score
* Deception detection

---

# 15. Experiment Lifecycle

Each experiment follows a defined sequence.

```text
1. Experiment Configuration
             ↓
2. Company Policy Creation
             ↓
3. Task Creation
             ↓
4. Developer Initialization
             ↓
5. Task Assignment
             ↓
6. Developer Execution
             ↓
7. Developer Status Report
             ↓
8. Actual vs Reported Comparison
             ↓
9. Auditor Evaluation
             ↓
10. Result Storage
             ↓
11. Dataset Generation
             ↓
12. Analytical Processing
             ↓
13. API Exposure
             ↓
14. Dashboard Visualization
```

---

# 16. Experiment Configuration

An experiment configuration defines the conditions under which the simulation operates.

A configuration should specify information such as:

```text
Experiment ID
Model
Model Configuration
Pressure Level
Reward
Penalty
Deadline
Number of Agents
Agent Roles
Agent Personalities
Task Difficulty
Number of Rounds
```

Recording these parameters is important for comparing experiments and reproducing results.

---

# 17. Data Generation

During simulation, agents generate behavioural observations.

A simplified data flow is:

```text
Agent State
     ↓
Task Execution
     ↓
Actual Progress
     ↓
Developer Report
     ↓
Reported Progress
     ↓
Deception Gap
     ↓
Auditor Evaluation
     ↓
Experiment Record
```

Each experiment produces structured data suitable for further analysis.

---

# 18. Experimental Dataset

The dataset contains observations from individual experiments.

Important fields include:

| Variable | Description |
|---|---|
| Pressure | Workplace pressure condition |
| Reward | Reward associated with the task |
| Penalty | Penalty associated with failure or poor performance |
| Deadline | Expected completion time |
| Role | Developer role |
| Personality | Developer personality configuration |
| Task Name | Assigned task |
| Task Difficulty | Difficulty of the task |
| Behaviour Strategy | Reported behavioural strategy |
| Actual Progress | Measured task progress |
| Reported Progress | Progress reported by the developer |
| Deception Gap | Difference between reported and actual progress |
| Bugs Introduced | Number of introduced bugs |
| Code Quality | Quality measure |
| Performance Score | Overall performance |
| Stress Index | Pressure-related stress measure |
| Honesty Score | Alignment between actual and reported state |
| Auditor Score | Auditor evaluation |
| Deception Detected | Auditor detection outcome |

---

# 19. Data Processing

The analytical layer processes the experimental dataset before presenting it to the frontend.

Typical processing includes:

* Data loading
* Data validation
* Filtering
* Aggregation
* Metric calculation
* Group comparisons
* Correlation analysis
* Statistical summaries
* Visualization preparation

Python libraries such as Pandas, NumPy, Scikit-learn, Plotly, Matplotlib, and Seaborn support the analysis pipeline.

---

# 20. Analytics Architecture

The current application separates data analysis from the frontend.

```text
Raw Experiment Data
        ↓
Python Analysis
        ↓
Analysis Services
        ↓
Structured Analytics
        ↓
FastAPI Endpoints
        ↓
React Frontend
```

This separation prevents the frontend from directly handling the underlying analytical logic.

---

# 21. Backend

The backend uses FastAPI.

Its responsibilities include:

* Providing REST APIs
* Loading analytical data
* Running analysis services
* Returning structured results
* Providing data to frontend visualizations
* Providing API documentation

The main backend components include:

```text
backend/
│
├── main.py
├── schemas.py
├── routes/
└── services/
    ├── analysis_service.py
    └── analysis_helpers.py
```

---

# 22. Backend Services

## analysis_service.py

This service contains the primary analytical logic used by the API layer.

It processes experimental data and prepares results for frontend consumption.

## analysis_helpers.py

This module contains supporting analytical functions used by the main analysis service.

## schemas.py

This module defines structured data models used by the API.

These schemas help maintain a consistent contract between the backend and frontend.

---

# 23. API Layer

The frontend communicates with the backend through REST APIs.

Current analytical endpoints include:

```text
GET /api/analytics/overview
GET /api/analytics/overview/scatter
GET /api/analytics/personality
GET /api/analytics/developers
GET /api/analytics/behavior
GET /api/pressure
GET /api/auditor
GET /api/dataset
```

The backend also provides:

```text
GET /health
```

for checking whether the API is running.

---

# 24. Analytics Endpoints

## Overview

```text
GET /api/analytics/overview
```

Provides high-level analytical metrics for the dashboard.

## Overview Scatter

```text
GET /api/analytics/overview/scatter
```

Provides data required for scatter-based analytical visualization.

## Personality

```text
GET /api/analytics/personality
```

Provides personality-related behavioural analysis.

## Developers

```text
GET /api/analytics/developers
```

Provides developer-level comparisons and metrics.

## Behaviour

```text
GET /api/analytics/behavior
```

Provides behavioural analysis data.

## Pressure

```text
GET /api/pressure
```

Provides pressure-related experimental analysis.

## Auditor

```text
GET /api/auditor
```

Provides auditor-related analysis.

## Dataset

```text
GET /api/dataset
```

Provides structured experimental dataset information.

---

# 25. Frontend

The frontend uses:

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts

The frontend is responsible for presenting analytical results rather than performing the core experiment.

---

# 26. Frontend Components

Important dashboard components include:

```text
KPICard.tsx
KPIGrid.tsx
ChartCard.tsx
OverviewCharts.tsx
Dashboard.tsx
```

These components provide reusable structures for displaying metrics and charts.

---

# 27. Dashboard Architecture

The dashboard follows this structure:

```text
React Dashboard
       │
       ├── KPI Cards
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

Each section receives analytical information from the FastAPI backend.

---

# 28. Overview Dashboard

The overview provides a high-level view of the experiment.

It includes:

* Key performance indicators
* Experiment statistics
* Behaviour summaries
* Pressure analysis
* Scatter analysis
* High-level research signals

The purpose of the overview is to allow users to understand the main experimental results before examining individual analytical sections.

---

# 29. Behaviour Analysis

Behaviour analysis focuses on relationships between agent actions and experimental conditions.

Important analysis areas include:

* Actual versus reported progress
* Deception gap
* Stress
* Performance
* Honesty
* Behaviour strategy

Example relationship:

```text
Stress
  ↓
Behaviour
  ↓
Reported Progress
  ↓
Deception Gap
```

---

# 30. Personality Analysis

Personality analysis compares behavioural outcomes across personality configurations.

The analysis examines:

* Performance
* Honesty
* Deception gap
* Stress
* Behaviour strategy

This allows researchers to determine whether different personality configurations show different behavioural patterns.

---

# 31. Developer Analysis

Developer analysis compares individual developers and developer roles.

Metrics include:

* Performance
* Bugs
* Code quality
* Pressure
* Behaviour
* Deception gap

This section allows researchers to identify differences between developer configurations.

---

# 32. Pressure Analysis

Pressure analysis examines the relationship between workplace pressure and agent outcomes.

Important variables include:

* Pressure
* Stress
* Performance
* Bugs
* Honesty
* Deception gap
* Auditor detection

A typical analytical relationship is:

```text
Pressure
    ↓
Stress
    ↓
Performance / Behaviour
    ↓
Deception Gap
```

---

# 33. Auditor Analysis

Auditor analysis evaluates the effectiveness of the independent Auditor Agent.

The system examines:

* Auditor score
* Deception detection
* Detection rate
* Pressure-dependent detection
* Developer behaviour

This allows researchers to compare observed developer behaviour with auditor decisions.

---

# 34. Dataset Explorer

The dataset explorer provides access to experimental observations.

Its purpose is to allow researchers to:

* Inspect individual records
* Filter observations
* Examine variables
* Compare experimental conditions
* Review generated data

The dataset explorer provides a direct connection between the raw research data and the visual analytical interface.

---

# 35. Technology Architecture

The current full-stack architecture is:

```text
                    AI / LLM Layer
                          │
                          ▼
                  Multi-Agent System
                          │
                          ▼
                  Experiment Runner
                          │
                          ▼
                   Experiment Data
                          │
                          ▼
                 Python Analysis Layer
                          │
                          ▼
                    FastAPI Backend
                          │
                     REST APIs
                          │
                          ▼
              React + TypeScript Frontend
                          │
                          ▼
                  Research Dashboard
```

---

# 36. Ollama and Local Models

The project supports local LLM execution through Ollama.

Ollama provides the model runtime used by experiments configured for local model execution.

The model layer is separate from the analytical layer.

This separation allows the same experimental data pipeline to be analyzed independently of the dashboard.

The exact model used depends on the experiment configuration.

---

# 37. Reproducibility

Research experiments should record their configuration and execution information.

Recommended experiment metadata includes:

```text
Experiment ID
Execution Date
Git Commit
Model
Model Version
Pressure Configuration
Reward Configuration
Penalty Configuration
Deadline
Agent Count
Agent Roles
Agent Personalities
Task Configuration
Number of Rounds
Dataset Location
```

The Git commit is particularly important because it identifies the exact code version used to generate an experiment.

---

# 38. Experiment Results

Experiment results are stored separately from the application logic.

A typical result flow is:

```text
Experiment
    ↓
Raw Results
    ↓
Processed Dataset
    ↓
Analysis
    ↓
Dashboard
```

Large experimental campaigns should not be mixed with source-code files unnecessarily.

---

# 39. Development History

The project evolved through multiple development phases.

## Phase 1: Research Prototype

The initial implementation focused on the multi-agent experiment and Streamlit-based analysis.

## Phase 2: Backend Migration

Analytical functionality was moved toward a FastAPI backend.

## Phase 3: React Foundation

A React and TypeScript frontend was introduced.

## Phase 4A: Analytics Contract

The backend analytics endpoints were structured into a defined API contract.

## Phase 4B: Dashboard Overview

The primary React dashboard and overview analytics were implemented.

## Phase 4C: Analytics Migration

Major analysis sections were migrated from the earlier Streamlit interface into React.

These included:

* Behaviour analysis
* Developer analysis
* Auditor analysis
* Personality analysis
* Pressure analysis
* Dataset exploration

## Current Development

The current development focus is improving the dashboard's visual hierarchy, typography, spacing, alignment, chart presentation, and overall research presentation.

---

# 40. Development Workflow

A typical development workflow is:

```text
Modify Backend
      ↓
Run FastAPI
      ↓
Test API
      ↓
Modify Frontend
      ↓
Run Vite
      ↓
Test Dashboard
      ↓
Run Build
      ↓
Commit Changes
```

Backend changes should be validated through API requests before relying on them in the frontend.

Frontend changes should be tested through the development server and production build.

---

# 41. Testing

Backend endpoint testing should verify:

* HTTP status
* Response structure
* Required fields
* Data types
* Empty dataset behaviour
* Error handling

Frontend testing should verify:

* API data rendering
* Chart rendering
* KPI calculations
* Filtering
* Responsive layout
* Navigation
* Loading states
* Error states

A production build should also be executed before major commits.

---

# 42. Error Handling

The application should handle situations such as:

* Backend unavailable
* Empty datasets
* Invalid experiment data
* Missing analytical fields
* Failed API requests
* Invalid configuration
* Missing model
* Model execution failure

The frontend should provide an appropriate state instead of displaying broken charts or undefined values.

---

# 43. Data Integrity

Experimental data should preserve the relationship between:

```text
Experiment
    ↓
Agent
    ↓
Task
    ↓
Behaviour
    ↓
Reported Result
    ↓
Actual Result
    ↓
Auditor Evaluation
```

Changing analytical calculations without documenting the change can make results from different experiment versions difficult to compare.

For this reason, analytical changes should be associated with a Git commit and experiment version.

---

# 44. Interpretation Guidelines

The project uses quantitative signals to identify behavioural patterns.

A large deception gap does not automatically indicate intentional deception.

For example:

```text
Actual Progress = 70
Reported Progress = 90
Deception Gap = 20
```

This observation indicates a discrepancy between actual and reported progress.

Additional evidence is required before interpreting the observation as intentional deceptive behaviour.

Research conclusions should therefore consider multiple variables together.

---

# 45. Research Analysis Strategy

A recommended analysis sequence is:

```text
1. Examine overall experiment statistics
                ↓
2. Compare pressure levels
                ↓
3. Examine stress changes
                ↓
4. Analyze actual vs reported progress
                ↓
5. Analyze deception gap
                ↓
6. Compare personalities
                ↓
7. Compare developer roles
                ↓
8. Examine auditor detection
                ↓
9. Analyze correlations
                ↓
10. Draw research conclusions
```

This sequence moves from descriptive statistics toward relationships between variables.

---

# 46. Machine Learning Extension

The experimental dataset provides a basis for future machine-learning experiments.

Potential features include:

```text
Pressure
Stress Index
Performance Score
Honesty Score
Deception Gap
Bugs Introduced
Code Quality
Auditor Score
Personality
Developer Role
Task Difficulty
```

Potential target:

```text
Deception Detected
```

Potential models include:

* Logistic Regression
* Decision Tree
* Random Forest
* Support Vector Machine
* K-Nearest Neighbors
* MLP Classifier

A future ML layer could investigate whether deception-related outcomes are predictable from environmental and behavioural features.

---

# 47. Limitations

## Synthetic Environment

The simulated organization does not represent a real workplace.

## Model Dependence

Different language models may produce different behaviours.

## Prompt Dependence

Changes in prompts or system instructions may affect agent behaviour.

## Limited Roles

The current system represents a limited set of organizational roles.

## Deception Interpretation

A numerical discrepancy does not prove intentional deception.

## Dataset Size

Statistical reliability depends on the number and diversity of experiments.

## Auditor Reliability

The Auditor Agent is itself an AI system and therefore its evaluation should not be treated as an unquestionable ground truth.

---

# 48. Future Development

Future development areas include:

* Larger agent populations
* More developer roles
* More personality configurations
* Dynamic pressure
* More realistic coding tasks
* Cross-model comparison
* Improved auditor architecture
* Human evaluation
* Statistical significance testing
* Confidence intervals
* Machine-learning prediction
* Random Forest feature importance
* Causal analysis
* Automated experiment comparison
* Experiment versioning
* Reproducible benchmark datasets

---

# 49. Expected Research Output

The final research output should contain:

```text
Experimental Configuration
          ↓
Experimental Dataset
          ↓
Descriptive Statistics
          ↓
Behavioural Analysis
          ↓
Pressure Analysis
          ↓
Personality Analysis
          ↓
Auditor Analysis
          ↓
Statistical Findings
          ↓
Research Conclusions
```

The dashboard acts as the primary interface for exploring these findings.

---

# 50. Project Value

The project combines several areas of computer science:

* Artificial Intelligence
* Large Language Models
* Multi-Agent Systems
* Agent-Based Simulation
* Software Engineering
* Data Analysis
* Data Visualization
* Machine Learning
* Experimental Research
* Human-AI Interaction

The main contribution is a controlled experimental platform for studying behavioural changes in AI software developers under simulated organizational pressure.

---

# 51. Final System

The complete system can be represented as:

```text
                    AI / LLM Models
                           │
                           ▼
                  Multi-Agent Organization
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          Manager      Developers      Auditor
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                  Experimental Results
                           │
                           ▼
                    Python Analytics
                           │
                           ▼
                    FastAPI Backend
                           │
                           ▼
                React Research Dashboard
                           │
                           ▼
                    Research Findings
```

The platform therefore connects the complete research pipeline:

```text
Experimentation
      +
Multi-Agent Simulation
      +
Data Generation
      +
Data Analysis
      +
API Layer
      +
Visualization
      +
Research Interpretation
```

---

# 52. Conclusion

**Under Pressure** provides a controlled environment for investigating how AI software developers behave under different organizational conditions.

The system combines a multi-agent simulation with experimental data collection, behavioural analysis, an independent auditor, a FastAPI analytics backend, and a React research dashboard.

The central analytical signal is the difference between actual and reported developer progress. Additional variables such as pressure, stress, performance, personality, bugs, code quality, honesty, and auditor evaluation provide additional context for interpreting behavioural outcomes.

The project is designed as a research platform rather than as a system that makes definitive claims about AI deception. Its purpose is to provide controlled experiments, measurable signals, and analytical tools for studying AI agent behaviour under pressure.