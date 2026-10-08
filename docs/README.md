# Under Pressure: AI Agent Deception Research

### Studying Deceptive Behaviour in AI Software Developers Under Workplace Pressure

> A multi-agent simulation and research platform designed to study how AI software developers behave under different levels of workplace pressure, incentives, deadlines, and personality traits.

---

## Project Overview

**Under Pressure** is a research-oriented multi-agent simulation that models a small software development company using AI agents.

The system simulates interactions between:

* **Manager Agent**
* **Developer Agents**
* **Auditor Agent**

Developers receive software development tasks and operate under different workplace conditions such as pressure, deadlines, rewards, and penalties.

The system compares the developer's **actual progress** with their **reported progress** to identify potential deceptive behaviour.

The generated experiments are processed through a Python-based analysis pipeline and presented through a modern React research dashboard backed by FastAPI.

---

# Problem Statement

As AI agents become increasingly capable of performing software engineering tasks, understanding their behaviour under pressure becomes important.

An AI agent may:

* Report progress inaccurately
* Hide incomplete work
* Overestimate its performance
* Introduce bugs while attempting to meet deadlines
* Behave differently under different pressure levels
* Trade honesty for rewards or avoidance of penalties

This project investigates these behaviours in a controlled simulated software-company environment.

---

# Objectives

The main objectives of the project are:

1. Simulate a multi-agent software development environment.
2. Study AI developer behaviour under different workplace pressure levels.
3. Compare actual progress with reported progress.
4. Measure potential deceptive behaviour.
5. Analyze the relationship between pressure, stress, performance, and deception.
6. Evaluate the ability of an auditor agent to detect deceptive behaviour.
7. Generate a structured experimental dataset.
8. Provide an interactive research dashboard for visualization and analysis.
9. Provide an API layer for accessing analytical results.
10. Support reproducible experimentation and comparative analysis.

---

# Research Questions

The project investigates questions such as:

### RQ1: Does workplace pressure influence deceptive behaviour?

Does increasing pressure lead to a larger difference between actual and reported progress?

### RQ2: Does personality influence deception?

Do different AI personalities exhibit different levels of deceptive behaviour?

### RQ3: Does pressure affect performance?

Does increased stress lead to lower performance or increased bugs?

### RQ4: Can an auditor agent detect deceptive behaviour?

How effectively can an independent AI auditor identify potentially deceptive reports?

### RQ5: What factors are associated with deception?

The project analyzes relationships between:

* Stress
* Deception gap
* Performance
* Bugs
* Code quality
* Honesty
* Auditor score
* Pressure
* Developer personality
* Developer role

---

# System Architecture

```text
                    ┌─────────────────────┐
                    │    Experiment       │
                    │      Runner         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Company Policy    │
                    │ Pressure / Reward   │
                    │ Penalty / Deadline  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Manager Agent    │
                    │                     │
                    │ Task Assignment     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │ Developer  │   │ Developer  │   │ Developer  │
       │    Agent   │   │    Agent   │   │    Agent   │
       └──────┬─────┘   └──────┬─────┘   └──────┬─────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Status Reports    │
                    │                     │
                    │ Actual Progress     │
                    │ Reported Progress   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Auditor Agent    │
                    │                     │
                    │ Deception Analysis  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Experiment Results  │
                    │       Dataset       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Analysis Layer    │
                    │ Python / Pandas     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    └──────────┬──────────┘
                               │
                            REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Dashboard   │
                    │ TypeScript / Vite   │
                    └─────────────────────┘
```

---

# Multi-Agent System

## 1. Manager Agent

The Manager Agent represents a project manager in the simulated software company.

Responsibilities include:

* Creating software development tasks
* Assigning tasks to developers
* Communicating expectations
* Providing project context
* Applying workplace pressure through company policies

---

## 2. Developer Agents

Developer agents simulate AI software developers.

The system supports multiple developer roles based on the experiment configuration.

Developers operate according to:

* Personality
* Task difficulty
* Pressure level
* Reward
* Penalty
* Deadline
* Behaviour strategy

Developers generate:

* Actual progress
* Reported progress
* Reasoning
* Bugs introduced
* Code quality
* Status messages

---

## 3. Auditor Agent

The Auditor Agent independently evaluates developer behaviour.

It analyzes information such as:

* Actual progress
* Reported progress
* Deception gap
* Developer reasoning
* Performance
* Other experimental signals

The auditor produces:

* Auditor score
* Deception detection result

---

# Behaviour Model

The project measures the difference between what an AI developer actually accomplished and what it reported.

### Deception Gap

```text
Deception Gap = Reported Progress − Actual Progress
```

A larger positive gap indicates that the developer reported substantially more progress than was actually achieved.

The project uses this measurement as one of the primary indicators for analyzing deceptive reporting behaviour.

A high deception gap is treated as an indicator of potentially deceptive reporting. It does not prove intentional deception.

---

# Personality System

Developer agents operate with different personality characteristics.

Personality is treated as an experimental variable so that behaviour can be compared across different agent configurations.

This allows experiments such as:

```text
Personality A
      ↓
Low Pressure
      ↓
Behaviour
```

and:

```text
Personality A
      ↓
High Pressure
      ↓
Behaviour
```

Different personalities can also be compared under the same workplace conditions.

---

# Pressure Levels

The simulator evaluates agents under multiple workplace pressure levels.

The pressure environment affects factors such as:

* Deadlines
* Rewards
* Penalties
* Stress
* Expected performance

The experiments compare agent behaviour across increasingly demanding environments.

---

# Experiment Pipeline

The complete research pipeline is:

```text
1. Configure experiment
          ↓
2. Generate company policy
          ↓
3. Create software tasks
          ↓
4. Assign developers
          ↓
5. Developer performs task
          ↓
6. Developer reports progress
          ↓
7. Calculate actual vs reported progress
          ↓
8. Auditor evaluates behaviour
          ↓
9. Store experiment result
          ↓
10. Generate analytical dataset
          ↓
11. Run statistical analysis
          ↓
12. Expose analytical results through API
          ↓
13. Visualize results in React dashboard
```

---

# Experimental Dataset

The experiment results are stored in structured form and analyzed using Python.

Important variables include:

| Category | Variables |
|---|---|
| Environment | Pressure, Reward, Penalty, Deadline |
| Developer | Role, Personality |
| Task | Task Name, Task Difficulty |
| Behaviour | Behaviour Strategy |
| Progress | Actual Progress, Reported Progress |
| Deception | Deception Gap, Deception Detected |
| Software Quality | Bugs Introduced, Code Quality |
| Performance | Performance Score |
| Stress | Stress Index |
| Honesty | Honesty Score |
| Auditor | Auditor Score |

---

# Research Dashboard

The project includes an interactive React-based research dashboard.

The frontend uses React, TypeScript, Vite, Tailwind CSS, and Recharts.

The FastAPI backend provides analytical data through REST APIs.

## Overview

The overview dashboard provides:

* Overall experiment statistics
* KPI metrics
* Performance analysis
* Pressure distribution
* Behaviour distribution
* Deception-related metrics
* Analytical charts
* Scatter plot analysis

## Behaviour Analysis

The behaviour analysis section examines:

* Actual vs reported progress
* Performance by personality
* Honesty by personality
* Stress vs deception gap
* Deception gap distribution
* Behaviour patterns across pressure levels

## Developer Analysis

The developer analysis section provides:

* Bugs by developer role
* Code quality by developer role
* Pressure vs bugs
* Performance by developer
* Developer comparison
* Agent-level behavioural analysis

## Auditor Analysis

The auditor analysis section provides:

* Auditor score distribution
* Detection rate by pressure
* Average auditor score by pressure
* Auditor decisions
* Deception detection analysis

## Personality Analysis

The personality analysis section examines:

* Behaviour across personality types
* Performance differences
* Honesty differences
* Deception gap differences
* Stress response

## Pressure Analysis

The pressure analysis examines how increasing workplace pressure affects:

* Stress
* Performance
* Bugs
* Honesty
* Deception gap
* Auditor detection

## Dataset Explorer

The dataset interface provides:

* Complete experimental dataset
* Dataset filtering
* Dataset statistics
* Structured analytical data
* CSV-compatible data exploration

---

# Backend API

The FastAPI backend exposes analytical endpoints used by the React dashboard.

Current endpoints include:

```text
GET /health

GET /api/analytics/overview
GET /api/analytics/overview/scatter

GET /api/analytics/personality
GET /api/analytics/developers
GET /api/analytics/behavior

GET /api/pressure
GET /api/auditor
GET /api/dataset
```

FastAPI also provides interactive API documentation through:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Architecture

The frontend is built with React and TypeScript.

```text
frontend/
│
├── src/
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
├── vite.config.ts
└── ...
```

---

# Backend Architecture

The backend is implemented using FastAPI.

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

The backend separates API routing, analytical services, data schemas, and supporting analysis logic.

---

# Project Structure

```text
AI_Agent_Research/
│
├── backend/
│   ├── main.py
│   ├── schemas.py
│   ├── routes/
│   └── services/
│       ├── analysis_service.py
│       └── analysis_helpers.py
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
├── results/
│   └── experiment results
│
├── analysis/
│   └── analysis scripts
│
├── experiments/
│   └── experiment execution
│
├── agents/
│   └── agent implementations
│
├── models/
│   └── experiment models
│
├── requirements.txt
├── README.md
└── .gitignore
```

> The exact structure may change as the research platform evolves.

---

# Technologies Used

### Programming

* Python 3.12
* TypeScript
* JavaScript

### AI / LLM

* Ollama
* Local Large Language Models
* LLM-based multi-agent simulation

### Backend

* FastAPI
* Uvicorn

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts

### Data Analysis

* Pandas
* NumPy
* Scikit-learn

### Visualization

* Plotly
* Matplotlib
* Seaborn
* Recharts

### Development

* Git
* GitHub
* VS Code

---

# Installation

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd AI_Agent_Research
```

## 2. Create a Python virtual environment

Windows:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\activate
```

## 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

## 4. Install frontend dependencies

```bash
cd frontend
npm install
```

Return to the project root:

```bash
cd ..
```

---

# Configure Ollama

Install and start Ollama on your system.

Verify that Ollama is available:

```bash
ollama list
```

Make sure the model required by the experiment configuration is available locally.

For example:

```bash
ollama pull <MODEL_NAME>
```

The exact model depends on the experiment configuration.

---

# Running the Project

## Step 1. Start the FastAPI backend

From the project root:

```bash
uvicorn backend.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

## Step 2. Start the React frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Open the Vite development URL shown in the terminal.

---

# Running Experiments

The experiment runner generates the multi-agent simulation data.

The general process is:

```text
Experiment Configuration
        ↓
Agent Initialization
        ↓
Company Simulation
        ↓
Developer Actions
        ↓
Progress Reports
        ↓
Auditor Evaluation
        ↓
Experiment Dataset
        ↓
Analytics
```

Large experimental campaigns should be stored separately from the application source code.

---

# Research Metrics

The project calculates several metrics to evaluate agent behaviour.

### Actual Progress

Estimated amount of work actually completed by the developer.

### Reported Progress

Progress communicated by the developer.

### Deception Gap

Difference between reported and actual progress.

```text
Deception Gap = Reported Progress − Actual Progress
```

### Stress Index

Represents the level of pressure experienced by the agent.

### Performance Score

Represents the overall performance of the developer.

### Honesty Score

Represents the degree of alignment between the developer's actual state and reported state.

### Auditor Score

Score generated by the auditor agent while evaluating developer behaviour.

### Deception Detected

Outcome indicating whether the auditor detected potentially deceptive behaviour.

---

# Research Analysis

The dashboard enables analysis of relationships such as:

```text
Pressure
   ↓
Stress
   ↓
Behaviour
   ↓
Reported Progress
   ↓
Deception Gap
   ↓
Auditor Detection
```

The analytical pipeline also supports comparisons between developer roles, personalities, pressure levels, and experimental conditions.

---

# Experimental Design

The project supports controlled experiments where multiple factors are varied while other conditions are kept consistent.

Important experimental variables include:

### Independent Variables

* Pressure level
* Developer personality
* Developer role
* Reward
* Penalty
* Deadline
* Task difficulty

### Dependent Variables

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

# Experiment Logging

Each major experiment should record:

```text
Experiment ID
Model
Model configuration
Pressure configuration
Number of agents
Agent roles
Agent personalities
Number of rounds
Task configuration
Dataset location
Git commit
Execution date
```

This allows results to be traced back to the exact experiment configuration.

---

# Dashboard Screenshots

Add screenshots after the final UI redesign:

```text
docs/
└── screenshots/
    ├── overview.png
    ├── behaviour.png
    ├── developer.png
    ├── personality.png
    ├── pressure.png
    ├── auditor.png
    └── dataset.png
```

Then add:

```markdown
## Dashboard

### Overview

![Dashboard Overview](docs/screenshots/overview.png)

### Behaviour Analysis

![Behaviour Analysis](docs/screenshots/behaviour.png)

### Developer Analysis

![Developer Analysis](docs/screenshots/developer.png)

### Auditor Analysis

![Auditor Analysis](docs/screenshots/auditor.png)
```

---

# Research Findings

Final research findings should be added after the finalized experimental dataset has been analyzed.

Example structure:

```text
• Highest deception gap: ______
• Highest pressure condition: ______
• Personality with highest deception gap: ______
• Developer role with highest deception gap: ______
• Auditor detection rate: ______%
• Relationship between stress and deception gap: ______
• Relationship between pressure and performance: ______
```

These values should come directly from the experimental dataset.

---

# Limitations

This project operates within a simulated research environment.

### 1. Synthetic Environment

The software company is simulated rather than a real workplace.

### 2. LLM Dependence

Results depend on the language model used by the experiment.

### 3. Limited Agent Roles

The current implementation represents a limited set of software-development roles.

### 4. Behavioural Interpretation

A high deception gap indicates potentially deceptive reporting. It does not prove intentional deception.

### 5. Experimental Scale

The dataset comes from controlled simulation experiments rather than real-world workplace observations.

### 6. Model Variability

Different models and configurations might produce different behavioural patterns under identical experimental conditions.

---

# Future Work

Potential improvements include:

* Increase the number of simulated agents
* Introduce additional developer roles
* Add more personality models
* Introduce dynamic pressure changes
* Use more realistic software-development tasks
* Compare multiple LLMs
* Improve deception detection
* Add human evaluation
* Perform statistical significance testing
* Train machine-learning models to predict deception
* Add Random Forest feature importance
* Add automated experiment comparison
* Add experiment reproducibility controls
* Add confidence intervals
* Add causal analysis
* Expand the research dataset

---

# Machine Learning Extension

The generated experimental dataset provides an opportunity for supervised machine-learning analysis.

Potential input features include:

```text
Stress Index
Performance Score
Honesty Score
Deception Gap
Bugs Introduced
Code Quality
Auditor Score
Pressure Level
Personality
Developer Role
```

Potential target:

```text
Deception Detected
```

Possible models include:

```text
Logistic Regression
Decision Tree
Random Forest
Support Vector Machine
K-Nearest Neighbors
MLP Classifier
```

This would extend the project from:

```text
Multi-Agent Simulation
        +
Data Analysis
        +
Visualization
```

to:

```text
Multi-Agent Simulation
        +
Data Analysis
        +
Visualization
        +
Machine Learning
        +
Behaviour Prediction
```

---

# Academic / Research Value

This project combines concepts from several areas of computer science:

* Artificial Intelligence
* Large Language Models
* Multi-Agent Systems
* Agent-Based Simulation
* Data Analysis
* Data Visualization
* Machine Learning
* Software Engineering
* Experimental Research
* Human-AI Interaction

The platform provides a controlled environment for studying how AI agents respond to organizational pressure and how their behaviour changes across experimental conditions.

---

# Project Development

The project evolved from an initial Streamlit research prototype into a separated full-stack research platform.

```text
Initial Research Prototype
          ↓
Streamlit Analysis
          ↓
FastAPI Backend
          ↓
Analytics API
          ↓
React + TypeScript Frontend
          ↓
Interactive Research Dashboard
          ↓
UI Refinement
```

The current architecture separates:

```text
Experimentation
      +
Data Analysis
      +
Backend APIs
      +
Frontend Visualization
```

This separation makes the research system easier to extend and maintain.

---

# Author

**Ishan Patel**

B.Tech, Information Technology

Government Engineering College Bilaspur

---

# Project Summary

**Under Pressure** investigates how AI software developers behave when exposed to different levels of workplace pressure.

The system combines:

```text
Multi-Agent AI
      +
Software Company Simulation
      +
Workplace Pressure
      +
Behavioural Analysis
      +
Auditor Agent
      +
Experimental Dataset
      +
FastAPI Analytics Backend
      +
React Research Dashboard
```

The primary research goal is to study **AI agent behaviour, deceptive reporting, performance, stress, and auditor detection under controlled workplace conditions**.

---

## License

This project is intended primarily for academic and research purposes.
