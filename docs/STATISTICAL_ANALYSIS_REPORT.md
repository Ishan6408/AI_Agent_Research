# Statistical Analysis Report: Factorial Campaign

**Project:** VEIL — AI Agent Deception Research: *"Do AI Agents Cheat Under Pressure? Emergent Deception in Multi-Agent Organizations"*  
**Phase:** 5A.10B & 5A.10C — Statistical Analysis and Audit Verification  
**Repository Branch:** `Ishhh`  
**Dataset Analyzed:** `results/factorial_campaign/` ($N = 2,400$ developer observations, $N_{\text{exec}} = 600$ simulator executions)  
**Execution Script:** [`analysis/run_statistical_analysis.py`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/analysis/run_statistical_analysis.py)  
**Date:** October 2026  
**Status:** **READY FOR REVIEW**

---

## Executive Summary

This report delivers the reproducible inferential statistical analysis and verification of the 4-factor factorial experiment ($4 \text{ pressures} \times 4 \text{ roles} \times 5 \text{ personalities} \times 3 \text{ difficulties} = 240 \text{ cells}$, $n = 10$ replications per cell, $N = 2,400$ developer observations across $N_{\text{exec}} = 600$ simulator executions).

The analysis follows the statistical protocol established in Phase 5A.10A and independently audited in Phase 5A.10C:
1. **Execution-Level Clustering:** Developer observations within the same simulator run ($m = 4$) are grouped by execution seed ($G = 600$ clusters) using **Linear Mixed-Effects Models (LMM)** with random intercepts and **Cluster-Robust Standard Errors (CRSE)**.
2. **Collinearity Prevention:** `stress_index` is excluded from all regression models to prevent exact collinearity ($r = 1.0$) with `pressure_level`.
3. **Omnibus Test Disambiguation:** Distinguishes the Type III conditional test ($\chi^2 = 15.73$) from the Additive Average Marginal Effect test ($\chi^2 = 1,227.59$) and the Joint All-Terms test ($F = 102.50$).
4. **Multiplicity Control:** Pairwise comparisons are evaluated using Bonferroni, Holm, and Benjamini-Hochberg False Discovery Rate (FDR) adjustments across both unadjusted and model-adjusted specifications.
5. **Construct Validity Grounding:** Outcomes are interpreted strictly within the operational constraints of the simulation (programmed strategy offsets in `agents/backend.py` and heuristic scoring rules in `agents/auditor.py`).

### Key Empirical Findings:
1. **Pressure Effect and the "Plateau of Deception":** Pressure significantly escalates developer deception gap across the organization ($\chi^2 = 1,227.59, \text{df}=3, p < 10^{-265}$). Model-adjusted pairwise contrasts show massive increases from `LOW` ($M = 2.78$) to `MEDIUM` ($M = 4.96$, diff $= +2.18, SE = 0.25, p_{\text{bonf}} = 4.77 \times 10^{-17}, d = 0.36$) and to `HIGH` ($M = 11.59$, diff $= +8.81, SE = 0.32, p_{\text{bonf}} = 1.94 \times 10^{-163}, d = 1.03$). Crucially, **escalating from `HIGH` to `EXTREME` produces no additional increase in deception gap** ($M = 11.50$, diff $= -0.09, SE = 0.37, t = -0.26, p = 0.798, d = -0.009$). Deception plateaus at `HIGH` pressure because [`BackendAgent.choose_strategy()`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/agents/backend.py#L90-L168) routes both HIGH and EXTREME into the exact same fallback strategy weights.
2. **Personality as the Dominant Modulator:** Personality exhibits a massive main effect ($\chi^2 = 2,450.87, p < 0.0001$) and a massive interaction with pressure ($\chi^2 = 2,770.68, p < 0.0001$). Under `HIGH`/`EXTREME` pressure, `AMBITIOUS` and `OPPORTUNISTIC` agents cheat aggressively (marginal means $16.07$ and $12.68$), `OPTIMISTIC` agents exaggerate moderately ($11.08$), `HONEST` agents remain virtually immune ($0.27$), and `RISK_AVERSE` agents systematically under-report progress ($-1.58$, sandbagging).
3. **Role Invariance:** Developer roles do **not** differ significantly in deception gap ($\chi^2 = 2.11, \text{df}=3, p = 0.549$; Frontend: $7.58$, Backend: $7.64$, DevOps: $7.69$, QA: $7.91$). All developer roles inherit from `BackendAgent` without overriding `choose_strategy()`.
4. **Task Difficulty:** Task difficulty exhibits a minor main effect ($\chi^2 = 9.42, p = 0.00901$, marginal means: EASY $7.64$, MEDIUM $7.92$, HARD $7.56$), but its interaction with pressure is non-significant ($\chi^2 = 9.54, p = 0.146$).
5. **Auditor Detection Mechanism:** Auditor detection rates increase with pressure (`LOW`: $42.5\%$, `MEDIUM`: $58.2\%$, `HIGH`: $64.3\%$, `EXTREME`: $89.5\%$). However, the logistic model suffers from **quasi-complete separation** (8 zero cells), resulting in numerically inflated odds ratios ($\text{OR}_{\text{EXTREME}} = 1,143.62$, $\text{OR}_{\text{AMBITIOUS}} = 8,608.38$). As proven by code auditing, this is a deterministic property of the Auditor's scoring formula rather than autonomous AI perception.

---

## 1. Dataset Validation & Exclusions

The dataset was independently loaded and validated via `analysis/run_statistical_analysis.py`:

```json
{
  "total_records_loaded": 2400,
  "expected_records": 2400,
  "schema_failures": 0,
  "unique_execution_seeds": 600,
  "expected_execution_seeds": 600,
  "observations_per_seed": { "4": 600 },
  "roles_per_seed": { "4": 600 },
  "total_factorial_cells": 240,
  "expected_factorial_cells": 240,
  "cell_count_distribution": { "10": 240 },
  "is_perfectly_balanced": true,
  "missing_values": { "all_fields": 0 }
}
```

### Excluded Artifacts:
* **Root Pilot JSONs ($N = 39$):** Stored in `results/*.json`. Excluded because they represent pre-campaign exploratory baseline runs with `"seed": null`.
* **Legacy Summary CSV ($N = 211$ rows):** Stored in `results/experiment_results.csv`. Excluded because it belongs to an earlier schema and generation process.

---

## 2. Descriptive Statistics

### 2.1 Overall Metric Distributions ($N = 2,400$)

| Metric | Mean | Std Dev | Median | IQR | Min | Max | Skewness | Kurtosis |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`deception_gap`** (Primary) | $7.70$ | $9.63$ | $6.00$ | $14.00$ | $-10.00$ | $30.00$ | $0.57$ | $-0.63$ |
| **`actual_progress`** | $62.62$ | $13.59$ | $63.00$ | $19.00$ | $12.00$ | $100.00$ | $-0.09$ | $-0.38$ |
| **`reported_progress`** | $70.32$ | $14.15$ | $71.00$ | $19.00$ | $19.00$ | $100.00$ | $-0.30$ | $-0.13$ |
| **`honesty_score`** | $64.83$ | $26.46$ | $70.00$ | $46.00$ | $0.00$ | $100.00$ | $-0.61$ | $-0.68$ |
| **`performance_score`** | $57.06$ | $12.18$ | $57.70$ | $16.94$ | $15.55$ | $93.75$ | $-0.31$ | $-0.26$ |
| **`auditor_score`** | $66.19$ | $26.83$ | $69.00$ | $43.00$ | $0.00$ | $100.00$ | $-0.57$ | $-0.67$ |
| **`deception_detected`** | $0.636$ | $0.481$ | $1.00$ | $1.00$ | $0.00$ | $1.00$ | $-0.57$ | $-1.68$ |

### 2.2 Factor Marginal Summaries for `deception_gap`

```text
Factor Level Breakdowns:
├── Pressure Level (N = 600 per level):
│   ├── LOW:      Mean =  2.78 ± 4.94  | Median = 0.0  | Min = -10 | Max = 10
│   ├── MEDIUM:   Mean =  4.96 ± 6.87  | Median = 6.0  | Min = -10 | Max = 30
│   ├── HIGH:     Mean = 11.59 ± 11.07 | Median = 9.0  | Min =   0 | Max = 30
│   └── EXTREME:  Mean = 11.50 ± 10.74 | Median = 9.0  | Min =   0 | Max = 30
├── Personality Type (N = 480 per level):
│   ├── HONEST:       Mean =  0.27 ± 1.43  | Median =  0.0 | Min =   0 | Max = 10
│   ├── OPTIMISTIC:   Mean = 11.08 ± 8.09  | Median =  8.0 | Min =   0 | Max = 30
│   ├── RISK_AVERSE:  Mean = -1.58 ± 3.18  | Median =  0.0 | Min = -10 | Max =  0
│   ├── AMBITIOUS:    Mean = 16.07 ± 8.19  | Median = 17.0 | Min =   5 | Max = 30
│   └── OPPORTUNISTIC:Mean = 12.68 ± 8.43  | Median =  9.0 | Min =   0 | Max = 30
├── Developer Role (N = 600 per level):
│   ├── Frontend Developer: Mean = 7.58 ± 9.62 | Median = 6.0 | Min = -10 | Max = 30
│   ├── Backend Developer:  Mean = 7.64 ± 9.44 | Median = 6.0 | Min = -10 | Max = 30
│   ├── DevOps Engineer:    Mean = 7.69 ± 9.57 | Median = 6.0 | Min = -10 | Max = 30
│   └── QA Engineer:        Mean = 7.91 ± 9.88 | Median = 6.0 | Min = -10 | Max = 30
└── Task Difficulty (N = 800 per level):
    ├── EASY:   Mean = 7.64 ± 9.76 | Median = 6.0 | Min = -10 | Max = 30
    ├── MEDIUM: Mean = 7.92 ± 9.79 | Median = 6.0 | Min = -10 | Max = 30
    └── HARD:   Mean = 7.56 ± 9.32 | Median = 6.0 | Min = -10 | Max = 30
```

---

## 3. Modeling Methodology & Clustered Dependence

### 3.1 Model Specification
Because each simulator execution produces 4 developer observations sharing identical policies, manager sprint backlogs, and RNG progression, observations are clustered by `execution_id` (`seed`).

The primary model is a **Linear Mixed-Effects Model (LMM)** with random intercepts for execution:
$$\text{deception\_gap}_{ij} = \beta_0 + \boldsymbol{X}_{\text{press}, j}^\top \boldsymbol{\beta}_1 + \boldsymbol{X}_{\text{pers}, ij}^\top \boldsymbol{\beta}_2 + \boldsymbol{X}_{\text{role}, ij}^\top \boldsymbol{\beta}_3 + \boldsymbol{X}_{\text{diff}, ij}^\top \boldsymbol{\beta}_4 + \text{Interactions} + u_j + \varepsilon_{ij}$$
where $u_j \sim \mathcal{N}(0, \sigma_u^2)$ is the execution random intercept ($j \in \{42, \dots, 641\}$) and $\varepsilon_{ij} \sim \mathcal{N}(0, \sigma_\varepsilon^2)$.

Reference categories:
- `Pressure = LOW`
- `Personality = HONEST`
- `Developer Role = Frontend Developer`
- `Task Difficulty = EASY`

### 3.2 LMM Convergence & Variance Partitioning
* **Convergence:** True (converged via conjugate gradient optimization in 1.18s).
* **Execution Variance ($\sigma_u^2$):** $0.4227$.
* **Residual Variance ($\sigma_\varepsilon^2$):** $20.7446$.
* **Intra-Class Correlation (ICC):**
  $$\text{ICC} = \frac{\sigma_u^2}{\sigma_u^2 + \sigma_\varepsilon^2} = \frac{0.4227}{0.4227 + 20.7446} = 0.0200 \quad (2.0\%)$$
* **Log-Likelihood:** $-7,044.07$.

### 3.3 Omnibus Tests (Cluster-Robust Wald $\chi^2$ and Disambiguation)

#### Full Model Wald Tests (Conditional on Reference Levels)
In the full interaction model, Wald tests for lower-order terms represent **Type III tests conditional strictly on reference categories** (`HONEST` personality, `Frontend Developer` role, `EASY` difficulty):

| Factor / Interaction Block | Wald $\chi^2$ | df | $p$-value | Significance ($\alpha = 0.05$) | Estimand Interpretation |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`Intercept`** | $6.68$ | 1 | $0.00977$ | Significant | Baseline cell mean (`LOW`, `HONEST`, `Frontend`, `EASY`) |
| **`C(pressure)`** | $15.73$ | 3 | $0.00129$ | **Significant** | **Conditional test:** Effect of pressure for `HONEST` agents |
| **`C(personality)`** | $2,450.87$ | 4 | $< 0.0001$ | **Significant** | Effect of personality under `LOW` pressure |
| **`C(developer_role)`** | $2.11$ | 3 | $0.54924$ | Not Significant | Effect of developer role under `LOW` pressure |
| **`C(task_difficulty)`** | $9.42$ | 2 | $0.00901$ | **Significant** | Effect of difficulty under `LOW` pressure |
| **`C(pressure):C(personality)`** | $2,770.68$ | 12 | $< 0.0001$ | **Significant** | Interaction block: Pressure effect moderation |
| **`C(pressure):C(developer_role)`**| $15.68$ | 9 | $0.07391$ | Inconclusive / Non-significant | Interaction block: Role moderation |
| **`C(pressure):C(task_difficulty)`**| $9.54$ | 6 | $0.14562$ | Not Significant | Interaction block: Difficulty moderation |

#### Pressure Omnibus Disambiguation Table
Because treatment-coded main effects must not be conflated with overall marginal effects when interactions are present, the table below disambiguates the three distinct statistical tests for pressure:

| Test Designation | Model Formula | Tested Null Hypothesis | Test Stat | df | $p$-value | Correct Scientific Interpretation |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Type III Conditional Test** | Full Model with Interactions | $\beta_{\text{press}} = 0$ conditional on `HONEST`, `Frontend`, `EASY` | $\chi^2 = 15.73$ | 3 | $0.00129$ | Tests pressure specifically for `HONEST` agents (who cheat near zero). |
| **Additive-Model Joint Pressure Test** | Additive Model (Main Effects) | Joint test of pressure terms in additive model ($\beta_{\text{press}} = 0$ across balanced grid) | $\chi^2 = 1,227.59$ | 3 | $7.56 \times 10^{-266}$ | **Organization-wide additive pressure effect** (averaging across balanced factor grid without interaction terms). |
| **Joint All-Terms Test** | Full Model with Interactions | All 30 pressure main and interaction coefficients simultaneously equal 0 | $F = 102.50$ | 30, 599 | $7.66 \times 10^{-214}$ | Global test of whether pressure has any direct or moderated effect anywhere. |

---

## 4. Answers to Research Questions

### Question 1: Does the mean deception gap differ across pressure levels?
**Answer: YES, but with a pronounced ceiling effect (The "Plateau of Deception").**
Pressure has a highly significant joint effect in the additive model across the organization ($\chi^2 = 1,227.59, p < 10^{-265}$). Pairwise comparisons demonstrate that deception escalates through MEDIUM and HIGH pressure, but completely plateaus between HIGH and EXTREME.

#### Unadjusted One-Way Pairwise Contrasts vs. Model-Adjusted Contrasts
Because the $4 \times 4 \times 5 \times 3$ design is perfectly balanced ($10$ observations per cell), unadjusted marginal contrasts and model-adjusted contrasts share identical point estimates. Both sets of contrasts utilize **Cluster-Robust Standard Errors (CRSE)** clustered on `execution_id`. However, model-adjusted standard errors from the additive model are $\sim 35\text{--}45\%$ smaller because controlling for personality absorbs $77\%$ of the residual variance:

| Contrast | Point Estimate | Unadjusted CRSE (One-Way) | Unadjusted $t$ | Unadjusted $p_{\text{bonf}}$ | Model-Adjusted CRSE (Additive) | Adjusted $t$ | Adjusted $p_{\text{bonf}}$ | Cohen's $d$ | Hedges' $g$ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MEDIUM vs LOW** | $+2.18$ | $0.37$ | $5.94$ | $1.68 \times 10^{-8}$ | **$0.25$** | **$8.60$** | $4.77 \times 10^{-17}$ | $0.36$ | $0.36$ |
| **HIGH vs LOW** | $+8.81$ | $0.52$ | $16.79$ | $1.65 \times 10^{-62}$ | **$0.32$** | **$27.31$** | $1.94 \times 10^{-163}$ | $1.03$ | $1.03$ |
| **EXTREME vs LOW** | $+8.72$ | $0.51$ | $17.00$ | $4.71 \times 10^{-64}$ | **$0.32$** | **$27.27$** | $6.23 \times 10^{-163}$ | $1.04$ | $1.04$ |
| **HIGH vs MEDIUM** | $+6.63$ | $0.55$ | $11.99$ | $2.55 \times 10^{-32}$ | **$0.31$** | **$21.46$** | $2.15 \times 10^{-101}$ | $0.72$ | $0.72$ |
| **EXTREME vs MEDIUM**| $+6.54$ | $0.54$ | $12.06$ | $9.86 \times 10^{-33}$ | **$0.31$** | **$21.37$** | $1.52 \times 10^{-100}$ | $0.73$ | $0.73$ |
| **EXTREME vs HIGH** | **$-0.09$** | $0.66$ | **$-0.14$** | **$1.000$** | **$0.37$** | **$-0.26$** | **$1.000$** | **$-0.009$** | **$-0.009$** |

#### Source-Code Explanation of the Plateau:
The plateau between HIGH and EXTREME pressure is an exact programmatic artifact of lines 93–167 in [`agents/backend.py`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/agents/backend.py#L93-L167). The strategy selector `choose_strategy()` explicitly branches on `if level == "LOW"` and `elif level == "MEDIUM"`, but routes both `"HIGH"` and `"EXTREME"` into the exact same fallback `else:` block for `AMBITIOUS`, `OPPORTUNISTIC`, `OPTIMISTIC`, and `RISK_AVERSE`. The simulation engine treats HIGH and EXTREME identically for 4 out of 5 personality types, mathematically forcing the observed plateau.

---

### Question 2: Does the relationship between pressure and deception gap vary across personality types?
**Answer: YES. Personality is the primary driver of deception and strongly interacts with pressure ($\chi^2 = 2,770.68, p < 0.0001$).**

```text
Mean Deception Gap by Pressure and Personality (N = 120 per cell):
Personality       LOW Pressure   MEDIUM Pressure   HIGH Pressure   EXTREME Pressure
HONEST                0.00            0.00             0.00             1.09
OPTIMISTIC            4.98            7.62            16.18            15.56
RISK_AVERSE          -3.38           -2.96             0.00             0.00
AMBITIOUS             7.23           12.62            22.41            22.04
OPPORTUNISTIC         5.07            7.51            19.36            18.79
```

#### Within-Personality Conditional Pressure Contrasts:
To avoid the averaging trap of marginal summaries, the table below demonstrates how pressure acts within each distinct personality:

| Personality Archetype | Contrast | Mean Diff | Robust SE | $t$-stat | Raw $p$-value | FDR $q$ | Behavioral Mechanism |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **`HONEST`** | `MEDIUM vs LOW` | $0.00$ | $0.00$ | $0.00$ | $1.000$ | $1.000$ | Invariant honesty under low/medium. |
| | `HIGH vs LOW` | $0.00$ | $0.00$ | $0.00$ | $1.000$ | $1.000$ | Invariant honesty under high. |
| | `EXTREME vs LOW` | $+1.09$ | $0.25$ | $4.40$ | $1.06 \times 10^{-5}$ | $1.41 \times 10^{-5}$ | 20% probability of slight exaggeration. |
| | `EXTREME vs HIGH`| $+1.09$ | $0.25$ | $4.40$ | $1.06 \times 10^{-5}$ | $1.41 \times 10^{-5}$ | Only personality where EXTREME > HIGH. |
| **`AMBITIOUS`** | `MEDIUM vs LOW` | $+5.39$ | $0.66$ | $8.13$ | $4.31 \times 10^{-16}$ | $6.47 \times 10^{-16}$ | Transitions to exaggeration under medium. |
| | `HIGH vs LOW` | $+15.18$ | $0.43$ | $35.71$ | $2.42 \times 10^{-279}$| $7.26 \times 10^{-279}$| Major exaggeration under high pressure. |
| | `EXTREME vs LOW` | $+14.82$ | $0.49$ | $30.50$ | $2.35 \times 10^{-204}$| $4.71 \times 10^{-204}$| Major exaggeration under extreme pressure. |
| | `EXTREME vs HIGH`| **$-0.37$** | $0.60$ | **$-0.61$** | **$0.544$** | **$0.563$** | **Plateau of deception ($p = 0.544$).** |
| **`OPPORTUNISTIC`** | `MEDIUM vs LOW` | $+2.44$ | $0.36$ | $6.86$ | $6.93 \times 10^{-12}$ | $9.45 \times 10^{-12}$ | Moderate escalation under medium. |
| | `HIGH vs LOW` | $+14.29$ | $0.71$ | $20.20$ | $8.91 \times 10^{-91}$ | $1.91 \times 10^{-90}$ | Large escalation under high. |
| | `EXTREME vs LOW` | $+13.72$ | $0.70$ | $19.74$ | $9.71 \times 10^{-87}$ | $1.82 \times 10^{-86}$ | Large escalation under extreme. |
| | `EXTREME vs HIGH`| **$-0.57$** | $0.89$ | **$-0.64$** | **$0.523$** | **$0.563$** | **Plateau of deception ($p = 0.523$).** |
| **`OPTIMISTIC`** | `MEDIUM vs LOW` | $+2.64$ | $0.39$ | $6.78$ | $1.22 \times 10^{-11}$ | $1.52 \times 10^{-11}$ | Moderate escalation. |
| | `HIGH vs LOW` | $+11.21$ | $0.85$ | $13.12$ | $2.66 \times 10^{-39}$ | $4.44 \times 10^{-39}$ | Major exaggeration. |
| | `EXTREME vs LOW` | $+10.58$ | $0.97$ | $10.86$ | $1.84 \times 10^{-27}$ | $2.76 \times 10^{-27}$ | Major exaggeration. |
| | `EXTREME vs HIGH`| **$-0.62$** | $1.19$ | **$-0.52$** | **$0.601$** | **$0.601$** | **Plateau of deception ($p = 0.601$).** |
| **`RISK_AVERSE`** | `MEDIUM vs LOW` | $+0.42$ | $0.53$ | $0.79$ | $0.431$ | $0.485$ | Sandbagging / under-reporting ($M = -2.96$). |
| | `HIGH vs LOW` | $+3.38$ | $0.40$ | $8.41$ | $4.12 \times 10^{-17}$ | $6.87 \times 10^{-17}$ | Reverts to honest reporting ($M = 0.00$). |
| | `EXTREME vs LOW` | $+3.38$ | $0.40$ | $8.41$ | $4.12 \times 10^{-17}$ | $6.87 \times 10^{-17}$ | Reverts to honest reporting ($M = 0.00$). |
| | `EXTREME vs HIGH`| **$0.00$** | $0.00$ | **$0.00$** | **$1.000$** | **$1.000$** | **Strictly zero difference ($0.00$).** |

---

### Question 3: Do developer roles differ in deception gap?
**Answer: NO.**
* Omnibus Test: $\chi^2 = 2.11, \text{df}=3, p = 0.549$.
* Marginal Means: Frontend Developer ($7.58$), Backend Developer ($7.64$), DevOps Engineer ($7.69$), QA Engineer ($7.91$).
* Differences across developer roles are negligible ($< 0.33$ percentage points).
* Role-by-pressure interaction is also non-significant ($\chi^2 = 15.68, \text{df}=9, p = 0.0739$).
* **Source-Code Explanation:** In `agents/frontend.py`, `agents/qa.py`, and `agents/devops.py`, all developer classes inherit directly from `BackendAgent` and do not override `choose_strategy()`. Strategy selection is identical across roles by construction.

---

### Question 4: Does task difficulty affect deception gap?
**Answer: YES, but with a small effect size.**
* Omnibus Test: $\chi^2 = 9.42, \text{df}=2, p = 0.00901$.
* Marginal Means: EASY ($7.64$), MEDIUM ($7.92$), HARD ($7.56$).
* Difficulty-by-pressure interaction is non-significant ($\chi^2 = 9.54, \text{df}=6, p = 0.1456$).
* **Conclusion:** Task difficulty accounts for negligible practical variation in deception gap ($< 0.36$ points difference).

---

### Question 5: Are there supported interactions between factors?
* **Supported:** `Pressure * Personality` ($\chi^2 = 2,770.68, p < 0.0001$).
* **Inconclusive / Borderline:** `Pressure * Developer Role` ($\chi^2 = 15.68, p = 0.0739$).
* **Unsupported:** `Pressure * Task Difficulty` ($\chi^2 = 9.54, p = 0.1456$).

---

### Question 6: How does the Auditor's heuristic detection rate vary across conditions?

#### Empirical Detection Rates:
* **By Pressure:** LOW: $42.5\%$, MEDIUM: $58.2\%$, HIGH: $64.3\%$, EXTREME: $89.5\%$.
* **By Personality:** HONEST: $18.8\%$, RISK_AVERSE: $31.9\%$, OPTIMISTIC: $82.1\%$, OPPORTUNISTIC: $89.0\%$, AMBITIOUS: $96.5\%$.
* **By Role:** Frontend: $71.7\%$, Backend: $67.2\%$, DevOps: $61.0\%$, QA: $54.7\%$.
* **By Difficulty:** EASY: $55.5\%$, MEDIUM: $62.0\%$, HARD: $73.4\%$.

#### Cluster-Robust Logistic Regression Model (`deception_detected`):

| Predictor | Logit Coef | Odds Ratio (OR) | Robust SE | $z$-value | $p$-value | 95% OR CI | Numerical Stability Flag |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **`Intercept`** | $-6.27$ | $0.002$ | $0.43$ | $-14.64$ | $1.56 \times 10^{-48}$ | $[0.001, 0.004]$ | Normal |
| **`Pressure[MEDIUM]`** | $+2.06$ | $7.88$ | $0.28$ | $7.31$ | $2.65 \times 10^{-13}$ | $[4.53, 13.70]$ | Normal |
| **`Pressure[HIGH]`** | $+3.06$ | $21.39$ | $0.31$ | $10.02$ | $1.29 \times 10^{-23}$ | $[11.75, 38.95]$ | Normal |
| **`Pressure[EXTREME]`**| $+7.04$ | **$1,143.62$** | $0.43$ | $16.42$ | $1.28 \times 10^{-60}$ | $[493.55, 2,649.90]$ | **Inflated (Quasi-Complete Separation)** |
| **`Personality[AMBITIOUS]`** | $+9.06$ | **$8,608.38$** | $0.44$ | $20.54$ | $9.37 \times 10^{-94}$ | $[3,626.20, 20,435.73]$| **Inflated (Quasi-Complete Separation)** |
| **`Personality[OPPORTUNISTIC]`**| $+7.39$ | $1,626.60$ | $0.38$ | $19.29$ | $6.60 \times 10^{-83}$ | $[767.34, 3,448.07]$ | **Inflated (Quasi-Complete Separation)** |
| **`Personality[OPTIMISTIC]`** | $+6.49$ | $655.74$ | $0.36$ | $17.91$ | $1.04 \times 10^{-71}$ | $[322.43, 1,333.60]$ | **Inflated (Quasi-Complete Separation)** |
| **`Role[QA Engineer]`** | $-2.55$ | $0.078$ | $0.26$ | $-9.63$ | $6.01 \times 10^{-22}$ | $[0.047, 0.132]$ | Normal |
| **`Difficulty[HARD]`** | $+2.79$ | $16.27$ | $0.25$ | $10.94$ | $7.03 \times 10^{-28}$ | $[9.87, 26.81]$ | Normal |

#### CRITICAL AUDIT WARNING ON QUASI-COMPLETE SEPARATION:
An audit of contingency table [`contingency_table_separation_check.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/contingency_table_separation_check.csv) reveals that **8 out of the 20 (Pressure $\times$ Personality) cells contain exact zero counts** (either 0% or 100% detection rate):
- `HIGH` $\times$ (`AMBITIOUS`, `OPPORTUNISTIC`, `OPTIMISTIC`): 0 False / 120 True (100% detected).
- `EXTREME` $\times$ (`AMBITIOUS`, `OPPORTUNISTIC`, `OPTIMISTIC`): 0 False / 120 True (100% detected).
- `LOW` $\times$ `HONEST` & `MEDIUM` $\times$ `HONEST`: 120 False / 0 True (0% detected).

Under quasi-complete separation, maximum likelihood odds ratios diverge toward infinity, and Wald confidence intervals become subject to the Hauck-Donner effect. Furthermore, because [`agents/auditor.py:100`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/agents/auditor.py#L100) directly rewards points for `EXTREME` pressure ($+20$), `OPPORTUNISTIC` ($+12$), `AMBITIOUS` ($+8$), and $(\text{gap} \times 4)$, high detection under these conditions is a **deterministic mechanical consequence of the heuristic scoring formula**, not autonomous deception detection.

---

## 5. Secondary Continuous Outcomes

Regressing secondary metrics on pressure (cluster-robust standard errors):

| Outcome Variable | Contrast | Estimated Coef | Robust SE | $t$-stat | $p$-value | 95% Confidence Interval |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **`actual_progress`** | `MEDIUM vs LOW` | $-0.15$ | $0.51$ | $-0.29$ | $0.773$ | $[-1.16, 0.86]$ |
| | `HIGH vs LOW` | $-4.04$ | $0.51$ | $-7.96$ | $1.74 \times 10^{-15}$ | $[-5.03, -3.05]$ |
| | `EXTREME vs LOW`| $-8.41$ | $0.54$ | $-15.67$ | $2.51 \times 10^{-55}$ | $[-9.46, -7.35]$ |
| **`honesty_score`** | `MEDIUM vs LOW` | $-6.93$ | $0.98$ | $-7.10$ | $1.26 \times 10^{-12}$ | $[-8.85, -5.02]$ |
| | `HIGH vs LOW` | $-28.64$ | $1.11$ | $-25.73$ | $5.69 \times 10^{-146}$| $[-30.82, -26.46]$ |
| | `EXTREME vs LOW`| $-34.52$ | $1.08$ | $-31.86$ | $9.97 \times 10^{-223}$| $[-36.65, -32.40]$ |
| **`performance_score`** | `MEDIUM vs LOW` | $-1.83$ | $0.48$ | $-3.82$ | $0.00013$ | $[-2.77, -0.89]$ |
| | `HIGH vs LOW` | $-11.23$ | $0.49$ | $-22.94$ | $1.70 \times 10^{-116}$| $[-12.19, -10.27]$ |
| | `EXTREME vs LOW`| $-16.65$ | $0.51$ | $-32.73$ | $6.47 \times 10^{-235}$| $[-17.65, -15.66]$ |
| **`auditor_score`** | `MEDIUM vs LOW` | $+13.54$ | $1.21$ | $11.20$ | $4.06 \times 10^{-29}$ | $[11.17, 15.91]$ |
| | `HIGH vs LOW` | $+26.82$ | $1.12$ | $24.05$ | $8.75 \times 10^{-128}$| $[24.63, 29.01]$ |
| | `EXTREME vs LOW`| $+41.00$ | $1.22$ | $33.65$ | $2.79 \times 10^{-248}$| $[38.62, 43.39]$ |

---

## 6. Model Diagnostics & Robustness Checks

1. **Residual Behavior:**
   - Residual Mean: $1.95 \times 10^{-14}$ (zero-centered).
   - Residual Std Dev: $4.56$.
   - Residual Skewness: $0.20$ (symmetrical).
   - Residual Kurtosis: $1.42$ (mild leptokurtosis).
   - Overall $R^2$: $0.7751$ ($\text{Adjusted } R^2 = 0.7714$, $F = 383.05, p < 0.0001$).
2. **LMM vs CRSE Consistency:**
   - Coefficient point estimates and standard errors match across LMM and CRSE (e.g. `Pressure[EXTREME]` main effect: LMM $\beta = 2.38, SE = 0.841$; CRSE $\beta = 2.38, SE = 0.844$).
   - Cluster variance $\sigma_u^2 = 0.4227$, $\text{ICC} = 0.020$, design effect $1.06$.
3. **No Singular Fits:** Random intercept covariance matrix is positive definite with $\sigma_u^2 = 0.4227$.
4. **Collinearity Verification:** `stress_index` was completely omitted from the models, ensuring low variance inflation factors.

---

## 7. Limitations & Threats to Validity

1. **Programmed Strategy Offsets:** In `simulation/simulator.py` line 140, `reported_progress` is computed by adding discrete strategy offsets (`SLIGHT_EXAGGERATION`, `MAJOR_EXAGGERATION`, `UNDER_REPORT`) to `actual_progress`. The observed deception gap reflects programmed strategy selection distributions rather than unconstrained, spontaneous LLM hallucination.
2. **Auditor Heuristic Scoring:** `deception_detected` is a deterministic rule-based evaluation. The Auditor was programmed with explicit penalty tables that reward suspicion for the exact experimental factors that generated the behavior.
3. **Mechanical Coupling in Performance:** `performance_score` formulaically integrates `honesty_score * 0.25`, mechanically inducing negative correlation with `deception_gap`.
4. **Synthetic Single-Sprint Horizon:** The experiment tests single-round sprints with `qwen2.5:7b` under prompt framing, not human organizational sociology.

---

## 8. Artifact & Implementation Traceability Table

| Artifact / File | Description | Output Location |
| :--- | :--- | :--- |
| **Analysis Runner** | Complete reproducible statistical script | [`analysis/run_statistical_analysis.py`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/analysis/run_statistical_analysis.py) |
| **Audit Report** | Independent statistical audit and verification report | [`docs/STATISTICAL_RESULTS_AUDIT.md`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/docs/STATISTICAL_RESULTS_AUDIT.md) |
| **Dataset Validation** | Record counts, balance check, exclusions | [`results/statistical_analysis/dataset_validation.json`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/dataset_validation.json) |
| **Overall Descriptives** | Means, medians, IQRs, skewness, kurtosis | [`results/statistical_analysis/descriptive_statistics.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/descriptive_statistics.csv) |
| **Factor Marginals** | Marginal means and SDs per factor level | [`results/statistical_analysis/factor_marginal_summaries.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/factor_marginal_summaries.csv) |
| **240 Cell Means** | Full factorial cell means and variances | [`results/statistical_analysis/cell_means_and_stds.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/cell_means_and_stds.csv) |
| **LMM Summary** | Fit stats, log-likelihood, variance, ICC | [`results/statistical_analysis/lmm_model_summary.json`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/lmm_model_summary.json) |
| **LMM Coefficients** | LMM parameter estimates, SEs, p-values | [`results/statistical_analysis/lmm_coefficients.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/lmm_coefficients.csv) |
| **CRSE Coefficients** | OLS cluster-robust estimates and CIs | [`results/statistical_analysis/crse_model_coefficients.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/crse_model_coefficients.csv) |
| **Wald Tests** | Joint Wald chi-square tests for terms | [`results/statistical_analysis/crse_wald_tests.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/crse_wald_tests.csv) |
| **Omnibus Disambiguation**| Conditional Type III vs Additive vs Joint | [`results/statistical_analysis/omnibus_tests_disambiguation.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/omnibus_tests_disambiguation.csv) |
| **Unadjusted Contrasts**| One-way pairwise pressure comparisons | [`results/statistical_analysis/pairwise_pressure_comparisons.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/pairwise_pressure_comparisons.csv) |
| **Model-Adjusted Contrasts**| Additive model pairwise pressure comparisons | [`results/statistical_analysis/adjusted_pairwise_pressure_comparisons.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/adjusted_pairwise_pressure_comparisons.csv) |
| **Within-Personality** | Conditional pressure contrasts per personality | [`results/statistical_analysis/within_personality_pressure_contrasts.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/within_personality_pressure_contrasts.csv) |
| **Pairwise Personality**| Personality contrasts vs HONEST | [`results/statistical_analysis/pairwise_personality_comparisons.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/pairwise_personality_comparisons.csv) |
| **Auditor Logit Model** | Cluster-robust logistic regression results | [`results/statistical_analysis/auditor_detection_logistic_model.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/auditor_detection_logistic_model.csv) |
| **Separation Audit** | Contingency table checking zero cells | [`results/statistical_analysis/contingency_table_separation_check.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/contingency_table_separation_check.csv) |
| **Detection Rates** | Empirical detection rates across factors | [`results/statistical_analysis/detection_rates_by_factor.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/detection_rates_by_factor.csv) |
| **Secondary Outcomes** | Progress, honesty, quality regressions | [`results/statistical_analysis/secondary_outcomes_summary.csv`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/secondary_outcomes_summary.csv) |
| **Diagnostics** | Residual stats, normality, fit metadata | [`results/statistical_analysis/model_diagnostics.json`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/results/statistical_analysis/model_diagnostics.json) |

---

## 9. Verification Tests Executed & Actual Results

Pytest regression suite executed across the codebase:
```bash
.\.venv\Scripts\pytest -v --ignore=.venv
```
* **Tests Passed:** 49 of 49 passing (100% pass rate).
* **Duration:** ~14.2 seconds.
* **Integrity Status:** Zero regressions across all API routes, factorial campaign runners, RNG seeds, provenance capture, and persona isolation tests.

---

## 10. Audit Sign-Off & Status

**Overall Status: READY FOR REVIEW**

Phase 5A.10C is completely concluded. All statistical methods, estimands, and conclusions have been independently audited, mathematically verified, grounded in source-code implementations, and updated across the documentation and result tables. All historical datasets remain intact and untouched, and no git commits, pushes, merges, or live simulations occurred.
