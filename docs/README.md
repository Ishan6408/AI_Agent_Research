# 🤖 Under Pressure — AI Agent Deception Research

### Studying Deceptive Behaviour in AI Software Developers Under Workplace Pressure

> A multi-agent simulation and research platform designed to study how AI software developers behave under different levels of workplace pressure, incentives, deadlines, and personality traits.

---

## 📌 Project Overview

**Under Pressure** is a research-oriented multi-agent simulation that models a small software development company using AI agents.

The system simulates interactions between:

* 👨‍💼 **Manager Agent**
* 👨‍💻 **Developer Agents**
* 🕵️ **Auditor Agent**

Developers receive software development tasks and operate under different workplace conditions such as pressure, deadlines, rewards, and penalties.

The system compares the developer's **actual progress** with their **reported progress** to identify potential deceptive behaviour.

The generated experiments are then analyzed using Python and visualized through an interactive Streamlit dashboard.

---

# 🎯 Problem Statement

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

# 🎯 Objectives

The main objectives of the project are:

1. Simulate a multi-agent software development environment.
2. Study AI developer behaviour under different workplace pressure levels.
3. Compare actual progress with reported progress.
4. Measure potential deceptive behaviour.
5. Analyze the relationship between pressure, stress, performance, and deception.
6. Evaluate the ability of an auditor agent to detect deceptive behaviour.
7. Generate a structured experimental dataset.
8. Provide an interactive research dashboard for visualization and analysis.

---

# 🧠 Research Questions

The project investigates questions such as:

### RQ1 — Does workplace pressure influence deceptive behaviour?

Does increasing pressure lead to a larger difference between actual and reported progress?

### RQ2 — Does personality influence deception?

Do different AI personalities exhibit different levels of deceptive behaviour?

### RQ3 — Does pressure affect performance?

Does increased stress lead to lower performance or increased bugs?

### RQ4 — Can an auditor agent detect deceptive behaviour?

How effectively can an independent AI auditor identify potentially deceptive reports?

### RQ5 — What factors are associated with deception?

The project analyzes relationships between:

* Stress
* Deception gap
* Performance
* Bugs
* Code quality
* Honesty
* Auditor score

---

# 🏗️ System Architecture

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
                    │     Analyzer        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Streamlit Dashboard │
                    └─────────────────────┘
```

---

# 🤖 Multi-Agent System

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

The system currently includes multiple developer roles, including:

* Backend Developer
* Other software-development roles represented in the experiment configuration

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

# 🧩 Behaviour Model

The project measures the difference between what an AI developer actually accomplished and what it reported.

### Deception Gap

```text
Deception Gap = Reported Progress − Actual Progress
```

A larger positive gap can indicate that the developer reported substantially more progress than was actually achieved.

The project uses this measurement as one of the primary indicators for analyzing deceptive reporting behaviour.

---

# 🧬 Personality System

Developer agents can operate with different personality characteristics.

Personality is treated as an experimental variable so that behaviour can be compared across different agent configurations.

This allows experiments such as:

```text
Personality A
       ↓
Low Pressure
       ↓
Behaviour

Personality A
       ↓
High Pressure
       ↓
Behaviour
```

and comparison between different personalities under the same conditions.

---

# 🚨 Pressure Levels

The simulator evaluates agents under multiple workplace pressure levels.

The pressure environment affects factors such as:

* Deadlines
* Rewards
* Penalties
* Stress
* Expected performance

The experiments can therefore compare agent behaviour across increasingly demanding environments.

---

# 🧪 Experiment Pipeline

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
11. Visualize results
```

---

# 📊 Experimental Dataset

The experiment results are stored in structured form and analyzed using Pandas.

Important variables include:

| Category         | Variables                           |
| ---------------- | ----------------------------------- |
| Environment      | Pressure, Reward, Penalty, Deadline |
| Developer        | Role, Personality                   |
| Task             | Task Name, Task Difficulty          |
| Behaviour        | Behaviour Strategy                  |
| Progress         | Actual Progress, Reported Progress  |
| Deception        | Deception Gap, Deception Detected   |
| Software Quality | Bugs Introduced, Code Quality       |
| Performance      | Performance Score                   |
| Stress           | Stress Index                        |
| Honesty          | Honesty Score                       |
| Auditor          | Auditor Score                       |

---

# 📈 Research Dashboard

The project includes an interactive Streamlit dashboard.

The dashboard provides:

### 📊 Overview

* Overall experiment statistics
* Performance vs stress
* Pressure distribution
* Behaviour strategy distribution
* Deception detection distribution

### 🧠 Behaviour Analysis

* Actual vs reported progress
* Performance by personality
* Honesty by personality
* Stress vs deception gap
* Deception gap distribution

### 👨‍💻 Developer Analysis

* Bugs by developer role
* Code quality by developer role
* Pressure vs bugs
* Performance by developer
* Developer comparison table

### 🕵️ Auditor Analysis

* Auditor score distribution
* Detection rate by pressure
* Average auditor score by pressure

### 📈 Correlation Analysis

* Correlation heatmap
* Top suspicious experiments
* Research findings
* Average experimental metrics

### 🗂️ Dataset Explorer

* Complete filtered dataset
* Interactive filtering
* Dataset information
* CSV export

---

# 🖥️ Dashboard Preview

Add your screenshots here after the final experiment run.

```text
docs/
└── screenshots/
    ├── overview.png
    ├── behaviour.png
    ├── developer.png
    ├── auditor.png
    └── correlation.png
```

Then add them to this README:

```markdown
## Dashboard

### Overview

![Dashboard Overview](docs/screenshots/overview.png)

### Behaviour Analysis

![Behaviour Analysis](docs/screenshots/behaviour.png)

### Developer Analysis

![Developer Analysis](docs/screenshots/developer.png)

### Correlation Analysis

![Correlation Analysis](docs/screenshots/correlation.png)
```

---

# 📁 Project Structure

```text
ai-agent-research/
│
├── agents/
│   ├── base_agent.py
│   ├── manager_agent.py
│   ├── backend_agent.py
│   └── auditor_agent.py
│
├── analysis/
│   ├── analyzer.py
│   └── dashboard.py
│
├── experiments/
│   └── runner.py
│
├── models/
│   ├── behavior.py
│   ├── environment.py
│   ├── personality.py
│   ├── task_difficulty.py
│   └── ...
│
├── policies/
│   └── ...
│
├── simulation/
│   └── simulator.py
│
├── results/
│   ├── experiments.json
│   └── experiment_summary.csv
│
├── utils/
│   └── ...
│
├── main.py
├── requirements.txt
├── README.md
└── .gitignore
```

> The exact structure may vary slightly depending on the current implementation.

---

# ⚙️ Technologies Used

### Programming

* Python 3.12

### AI / LLM

* Ollama
* Local Large Language Models

### Data Analysis

* Pandas
* NumPy

### Visualization

* Plotly
* Streamlit

### Development

* Git
* GitHub
* VS Code

---

# 💻 Installation

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ai-agent-research
```

---

## 2. Create a virtual environment

```bash
python3.12 -m venv .venv
```

Activate it on macOS/Linux:

```bash
source .venv/bin/activate
```

---

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

# 🧠 Configure Ollama

Install and start Ollama on your system.

Verify that it is available:

```bash
ollama list
```

Make sure the model required by the project is available locally.

For example:

```bash
ollama pull <MODEL_NAME>
```

The exact model depends on the configuration used by the project.

---

# ▶️ Running the Project

## Step 1 — Run experiments

From the project root:

```bash
python main.py
```

This runs the multi-agent simulation and generates experimental results.

---

## Step 2 — Analyze the experiments

After the simulation completes:

```bash
python analysis/analyzer.py
```

This processes the raw experiment results and generates:

```text
results/experiment_summary.csv
```

---

## Step 3 — Launch the dashboard

```bash
streamlit run analysis/dashboard.py
```

The Streamlit dashboard will open in your browser.

---

# 🧪 Experiment Configuration

The number of experiments can be controlled using `runs_per_pressure` in:

```text
experiments/runner.py
```

For example:

```python
def __init__(self, runs_per_pressure=10):
    self.runs_per_pressure = runs_per_pressure
```

If the experiment uses four pressure levels and four developer roles:

```text
4 pressure levels
× 10 runs
× 4 developers
----------------
160 experiments
```

A larger dataset provides more observations for research visualization and statistical analysis.

---

# 🔬 Research Metrics

The project calculates several metrics to evaluate agent behaviour.

### Actual Progress

Estimated amount of work actually completed by the developer.

### Reported Progress

Progress communicated by the developer to the manager.

### Deception Gap

Difference between reported and actual progress.

### Stress Index

Represents the level of pressure/stress experienced by the agent.

### Performance Score

Represents the overall performance of the developer.

### Honesty Score

Represents the degree of alignment between the developer's actual state and reported state.

### Auditor Score

Score generated by the auditor agent when evaluating the developer's behaviour.

### Deception Detected

Binary outcome indicating whether deceptive behaviour was detected.

---

# 📊 Example Research Analysis

The dashboard can be used to investigate relationships such as:

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

The correlation analysis helps identify relationships between numerical experimental variables.

---

# 📝 Research Findings

The final research findings should be added here after the large experiment dataset has been generated.

For example:

```text
• The highest deception gap was observed under ______ pressure.
• The personality with the highest average deception gap was ______.
• The developer role with the highest average deception gap was ______.
• Auditor detection rate was ______%.
• Stress showed a ______ relationship with deception gap.
```

> These values should be filled using the final experimental dataset rather than manually estimated.

---

# ⚠️ Limitations

This project is a simulated research environment and therefore has several limitations.

### 1. Synthetic Environment

The software company is simulated rather than a real workplace.

### 2. LLM Dependence

Results may vary depending on the language model used.

### 3. Limited Agent Roles

The current implementation models a limited number of software-development roles.

### 4. Behavioural Interpretation

A high deception gap is treated as an indicator of potentially deceptive reporting, but it does not necessarily prove intentional deception.

### 5. Experimental Scale

The current dataset is generated from controlled simulation experiments rather than real-world observations.

---

# 🚀 Future Work

Potential improvements include:

* Increase the number of simulated agents
* Introduce additional developer roles
* Add more personality models
* Introduce dynamic pressure changes
* Use real coding tasks
* Add reinforcement learning
* Improve deception detection
* Compare multiple LLMs
* Perform statistical significance testing
* Train machine-learning models to predict deception
* Add Random Forest feature importance
* Automatically export research charts
* Add experiment reproducibility controls

---

# 🤖 Optional Machine Learning Extension

A future version can use the generated experimental dataset to train a machine-learning classifier.

### Example

Input features:

```text
Stress Index
Performance Score
Honesty Score
Deception Gap
Bugs Introduced
Code Quality
Auditor Score
```

Target:

```text
Deception Detected
```

Possible model:

```text
Random Forest Classifier
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
Machine Learning Prediction
```

---

# 🎓 Academic / Research Value

This project demonstrates concepts from several areas of computer science:

* Artificial Intelligence
* Large Language Models
* Multi-Agent Systems
* Agent-Based Simulation
* Data Analysis
* Data Visualization
* Machine Learning
* Software Engineering
* Experimental Research

The project provides a controlled environment for studying how AI agents respond to different environmental and organizational pressures.

---

# 👨‍💻 Author

**Praveen Kumar Jha**

B.Tech — Computer Science and Engineering

Government Engineering College Bilaspur

---

# ⭐ Project Summary

**Under Pressure** investigates how AI software developers behave when exposed to different levels of workplace pressure.

The system combines:

```text
Multi-Agent AI
      +
Software Company Simulation
      +
Behavioural Analysis
      +
Auditor Agent
      +
Experimental Dataset
      +
Interactive Dashboard
```

The ultimate goal is to better understand **AI agent behaviour, deceptive reporting, and the effects of pressure in simulated software engineering environments.**

---

## 📜 License

This project is intended primarily for academic and research purposes.
