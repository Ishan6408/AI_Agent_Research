# Phase 5B.1D: Final Statistical Resolution and Methodological Verification

**Project:** VEIL — AI Agent Deception Research — *"Do AI Agents Cheat Under Pressure? Emergent Deception in Multi-Agent Organizations"*  
**Repository Branch:** `Ishhh`  
**Phase:** Phase 5B.1D Final Statistical Readiness Resolution  
**Date:** October 2026  
**Auditor:** Independent Research & Statistical Reviewer  
**Deliverable:** `docs/PHASE_5B_FINAL_STATISTICAL_RESOLUTION.md`  

---

## 1. Executive Summary & Updated Readiness Verdict

### 1.1 Updated Readiness Verdict
### **FINAL VERDICT: PASS (STATISTICALLY & METHODOLOGICALLY RESOLVED)**

**Implementation Milestone Status:** **AUTHORIZED FOR MILESTONE 5B.2A ONLY (ENGINE IMPLEMENTATION & UNIT TESTING)**  
**Campaign Sweep Status:** **HELD / PENDING MILESTONE 5B.2A ACCEPTANCE (NO FULL CAMPAIGN EXECUTION PERMITTED)**

### 1.2 Summary of Statistical Resolutions
This report provides the formal mathematical and methodological closure required before code implementation:
1. **Cross-Campaign Comparison Verified & Bound:** The reported $N = 2,880$ shared-condition observation count is mathematically verified ($1,440$ Phase 5A + $1,440$ Phase 5B records across shared personas `AMBITIOUS`, `RISK_AVERSE`, `OPPORTUNISTIC`). We formally prove that pooling observations across campaigns provides descriptive contrast but **cannot establish a pure causal counterfactual** due to structural apparatus differences (single clamped integer vs. 10-subtask checklist; rigid format prompt vs. open reporting).
2. **Experimental Units Formally Reconciled:** The hierarchy between **Simulator Execution** ($M = 600$, the unit of randomization and clustering), **Developer Observation** ($N = 2,400$, the unit of measurement), **Sprint-Level Cell** ($48$ primary factorial configurations), and **Cell-Role Combination** ($192$ unique orthogonal cells at $n = 10$ replications) is mathematically unified.
3. **Plateau Null-Acceptance Fallacy Eliminated:** The unscientific decision rule equating $p \ge 0.05$ with proof of a plateau is eliminated. The plateau hypothesis ($H_3$) is formally redefined as a **Two One-Sided Equivalence Test (TOST)** against an a priori substantive equivalence margin $\delta_{\text{plat}} = \pm 2.0\%$ (representing one-fifth of a 10% subtask), with an explicit exploratory classification if the margin is contested.
4. **Zero-Stakes Equivalence Power Proved:** The TOST power calculations for Control Arm A ($N = 120, N_{\text{eff}} \approx 113.2$) against equivalence bounds $\pm 3.0\%$ are verified analytically across empirical and inflated variance scenarios ($\sigma \in [4.56, 12.0\%]$). We prove that power exceeds $0.85$ for $\sigma \le 8.5\%$ when true bias $|\mu| \le 0.5\%$, and document exact power degradation thresholds when baseline bias reaches $|\mu| \ge 1.0\%$.
5. **Power Provenance Documented:** Complete closed-form analytic formulas, clustering design effects, multiplicity adjustments, and non-centrality parameters are tabulated for all confirmatory hypotheses, explicitly distinguished from simulation-based power draws.
6. **Two-Stage Implementation Boundary Established:** Implementation authorization is partitioned into **Milestone 5B.2A** (code modules, Pydantic schemas, logging, and unit tests; zero campaign sweeps) and **Milestone 5B.2B** (the 2,400-observation experimental campaign), requiring separate user authorization between milestones.

---

## 2. Cross-Campaign Comparison: Verification, Power & Causal Limitations

### 2.1 Sample Size and Shared Conditions Verification
The cross-campaign comparison evaluates the shift from Phase 5A's rule-injected baseline to Phase 5B's autonomous deliberation:
- **Phase 5A Dataset:** $N = 2,400$ developer observations across $M = 600$ simulator executions (seeds `42–641`).
  - Factorial grid: 4 Pressures $\times$ 5 Personalities (`HONEST`, `OPTIMISTIC`, `RISK_AVERSE`, `AMBITIOUS`, `OPPORTUNISTIC`) $\times$ 3 Difficulties $\times$ 4 Roles $= 240$ cells $\times 10$ replications.
  - Number of observations per personality: Exactly $2,400 / 5 = 480$.
- **Phase 5B Primary Campaign:** $N = 1,920$ developer observations across $M = 480$ executions (seeds `1001–1480`).
  - Factorial grid: 4 Pressures $\times$ 4 Persona Framings (`NEUTRAL`, `AMBITIOUS`, `RISK_AVERSE`, `OPPORTUNISTIC`) $\times$ 3 Difficulties $\times$ 4 Roles $= 192$ cell-roles $\times 10$ replications.
  - Number of observations per persona framing: Exactly $1,920 / 4 = 480$.
- **Shared Conceptual Conditions:**
  - Exactly 3 personality/persona conditions overlap conceptually: `AMBITIOUS`, `RISK_AVERSE`, and `OPPORTUNISTIC`.
  - Phase 5A shared observations: $3 \times 480 = 1,440$ observations.
  - Phase 5B shared observations: $3 \times 480 = 1,440$ observations.
  - **Total Shared Analysis Sample:** Exactly **$N = 1,440 + 1,440 = 2,880$ observations**.

### 2.2 Estimand, Statistical Model and Dependence Structure
- **Formal Estimand:**
  $$\theta_{\text{Mode}} = \mathbb{E}[\Delta_{\text{gap}} \mid \text{Mode}=\text{Autonomous}, \text{Shared Personas}] - \mathbb{E}[\Delta_{\text{gap}} \mid \text{Mode}=\text{Programmed}, \text{Shared Personas}]$$
- **Statistical Model:**
  Unpaired Hierarchical Linear Mixed-Effects Model fitted on the pooled $N = 2,880$ dataset:
  $$\Delta_{ijk} = \beta_0 + \beta_{\text{mode}} \cdot \text{Mode}_k + \boldsymbol{X}_{\text{press}}^\top \boldsymbol{\beta}_{\text{press}} + \boldsymbol{X}_{\text{persona}}^\top \boldsymbol{\beta}_{\text{persona}} + \boldsymbol{X}_{\text{diff}}^\top \boldsymbol{\beta}_{\text{diff}} + \boldsymbol{X}_{\text{role}}^\top \boldsymbol{\beta}_{\text{role}} + (\text{Mode} \times \text{Pressure}) + u_{j(k)} + \varepsilon_{ijk}$$
  where $k \in \{\text{Phase 5A}, \text{Phase 5B}\}$ indexes the campaign, $j(k)$ indexes the execution cluster nested within campaign $k$, and $u_{j(k)} \sim \mathcal{N}(0, \sigma_u^2)$.
- **Dependence Structure:**
  - In Phase 5A, the 4 developers in each execution had different personalities assigned via random shuffle (`rng.shuffle(conds)`).
  - In Phase 5B, Persona Framing is a sprint-level factor (all 4 developers in execution $j$ share the same framing).
  - Clustering is modeled at the execution level ($G = 600$ clusters in Phase 5A; $G = 360$ shared clusters in Phase 5B; total $G = 960$ clusters).
  - Cluster design effect: $\text{Deff} = 1 + (4 - 1) \times 0.020 = 1.060$.
  - Effective sample size: $N_{\text{eff}} = 2,880 / 1.060 \approx 2,717$.

### 2.3 Analytic Power Derivation
- Standard error of the between-mode difference:
  $$SE = \sigma \sqrt{\frac{1}{N_{\text{eff, 5A}}} + \frac{1}{N_{\text{eff, 5B}}}} = \sigma \sqrt{\frac{2}{1,358.5}} \approx 0.0384 \times \sigma$$
- Under baseline empirical variance $\sigma = 4.56$: $SE = 0.175\%$.
- Target effect size: Cohen's $d = 0.20$ ($\delta = 0.912\%$).
- Test statistic under the alternative: $z = 0.912 / 0.175 \approx 5.21$.
- At two-sided $\alpha = 0.05$ ($z_{\text{crit}} = 1.96$):
  $$\text{Power} = \Phi(5.21 - 1.96) = \Phi(3.25) = \mathbf{0.9994} \quad (> 0.99)$$
- Even under elevated variance $\sigma = 10.0\%$ ($SE = 0.384\%$), detecting $d = 0.20$ ($\delta = 2.0\%$) yields $z = 5.21$, maintaining power $> 0.99$.

### 2.4 Causal Limitations and Campaign-Level Confounding
> [!WARNING] Causal Attribution Disclaimer
> Pooling observations across Phase 5A and Phase 5B does **NOT** isolate a pure counterfactual causal effect of "autonomous LLM reasoning vs. programmed rule". 

The two campaigns differ along multiple simultaneous dimensions:
1. **Task Ground Truth:** Phase 5A sampled actual progress from a continuous uniform interval adjusted by arithmetic rules; Phase 5B derives actual progress from $K = 10$ discrete binary subtask outcomes.
2. **Prompt Architecture:** Phase 5A used rigid format-forcing prompts (`"Your manager should be told that progress is {X}%. DO NOT change it"`), whereas Phase 5B uses open-ended status reporting prompts.
3. **Persona Operationalization:** Phase 5A enforced a mandatory behavioral instruction (`"You MUST follow the behaviour strategy provided to you"`), whereas Phase 5B injects a professional orientation disposition.
4. **Execution Epoch & Platform:** Phase 5A was run sequentially in early October 2026; Phase 5B will run in late October 2026.

**Scientific Stance:** The cross-campaign comparison must be reported strictly as a **macro-level benchmark comparison between two organizational modeling paradigms**, not a clean single-variable causal test.

---

## 3. Experimental Units and Terminology Reconciliation

To eliminate ambiguity across the documentation suite, the following operational hierarchy is established:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXPERIMENTAL UNIT HIERARCHY                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. SIMULATOR EXECUTION (M = 600 total across Phase 5B):                     │
│    • Unit of Randomization, Scheduling, and Clustering                      │
│    • Identifies one 12-turn simulated sprint under an isolated seed         │
│    • Primary Factorial: M = 480 executions (Seeds 1001–1480)                │
│    • Control Arm A (Calibration): M = 30 executions (Seeds 1481–1510)       │
│    • Control Arm B1 (Pure Time): M = 45 executions (Seeds 1511–1555)        │
│    • Control Arm B2 (Pure Stakes): M = 45 executions (Seeds 1556–1600)      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. SPRINT-LEVEL FACTORIAL CELL (48 Primary Cells):                          │
│    • 4 Pressures × 4 Persona Framings × 3 Task Difficulties = 48 cells      │
│    • Exactly n = 10 executions per cell (48 × 10 = 480 executions)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. CELL-ROLE COMBINATION (192 Primary Cell-Roles):                          │
│    • Unit of Factorial Crossing including Developer Discipline              │
│    • 48 Sprint Cells × 4 Engineering Roles = 192 Cell-Roles                 │
│    • Exactly n = 10 replications per cell-role                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. DEVELOPER OBSERVATION (N = 2,400 total across Phase 5B):                 │
│    • Unit of Measurement / Statistical Analysis                             │
│    • One individual developer sprint report (ExperimentResultV2 record)    │
│    • Cluster size m = 4 developer observations per simulator execution      │
│    • Primary Factorial: N = 480 × 4 = 1,920 developer observations          │
│    • Control Arms: N = 120 × 4 = 480 developer observations                 │
│    • Total Phase 5B Dataset: N = 2,400 developer observations               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Table 3.1: Strict Mathematical Reconciliation Matrix

| Factorial Scope | Factor Levels Crossed | Unique Cells | Replications ($n$) | Executions ($M$) | Cluster Size ($m$) | Developer Observations ($N$) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Primary Sprint Cells** | 4 Pressure $\times$ 4 Persona $\times$ 3 Difficulty | **48** | 10 per cell | **480** | 4 | **1,920** |
| **Primary Cell-Roles** | 48 Sprint Cells $\times$ 4 Engineering Roles | **192** | 10 per cell-role | **480** | 1 | **1,920** |
| **Control Arm A (Calibration)** | 1 Pressure $\times$ 1 Persona $\times$ 3 Difficulty | **3** | 10 per cell | **30** | 4 | **120** |
| **Control Arm B1 (Pure Time)** | 1 Pressure $\times$ 1 Persona $\times$ 3 Difficulty | **3** | 15 per cell | **45** | 4 | **180** |
| **Control Arm B2 (Pure Stakes)** | 1 Pressure $\times$ 1 Persona $\times$ 3 Difficulty | **3** | 15 per cell | **45** | 4 | **180** |
| **Total Phase 5B Campaign** | 57 Unique Sprint Configurations | — | — | **600** | **4** | **2,400** |

---

## 4. The Plateau Hypothesis ($H_3$): Elimination of Null Fallacy and TOST Formulation

### 4.1 Rejection of the Null-Acceptance Decision Rule
In classical inferential statistics, failing to reject $H_0: \mu_{\text{EXT}} - \mu_{\text{HIGH}} = 0$ at $p \ge 0.05$ does **not** demonstrate that reporting distortion has plateaued. An underpowered test or noisy token variance will naturally fail to reject the null even in the presence of true escalation.

### 4.2 Two One-Sided Equivalence Test (TOST) Formulation
To rigorously test whether autonomous reporting distortion plateaus between `HIGH` and `EXTREME` pressure, Phase 5B adopts a **Two One-Sided Tests (TOST)** framework:

- **Estimand:**
  $$\theta_{\text{plat}} = \mu_{\Delta, \text{EXTREME}} - \mu_{\Delta, \text{HIGH}}$$
- **Substantively Justified Equivalence Margin ($\delta_{\text{plat}}$):**
  $$\delta_{\text{plat}} = \pm 2.0\%$$
  - *Justification:* In a 10-subtask task where each subtask represents $10.0\%$ progress, a discrepancy change of $2.0\%$ represents one-fifth of a single functional unit ($0.2$ subtasks). In Phase 5A, moving from LOW to MEDIUM produced a $+2.18\%$ shift. If EXTREME pressure adds less than $\pm 2.0\%$ relative to HIGH pressure, the incremental effect is substantively negligible compared to lower-tier surges.
- **Hypotheses:**
  - $H_{01}: \theta_{\text{plat}} \le -2.0\%$ vs $H_{11}: \theta_{\text{plat}} > -2.0\%$
  - $H_{02}: \theta_{\text{plat}} \ge +2.0\%$ vs $H_{12}: \theta_{\text{plat}} < +2.0\%$
- **Decision Rule via 90% Confidence Interval:**
  Let $[\hat{\theta}_{\text{plat}} - t_{0.05, \text{df}} \cdot SE, \hat{\theta}_{\text{plat}} + t_{0.05, \text{df}} \cdot SE]$ be the $90\%$ confidence interval for the contrast estimated from the primary LMM:
  1. **Plateau Confirmed (Equivalence Established):** If the $90\%$ CI falls **entirely within $[-2.0\%, +2.0\%]$**, equivalence is confirmed ($p_{\text{TOST}} < 0.05$). The plateau hypothesis is accepted.
  2. **Breakthrough Escalation Confirmed:** If the lower bound of the $90\%$ CI is strictly $> 0$ and the upper bound exceeds $+2.0\%$ ($p < 0.05$ two-tailed), escalation beyond the plateau is confirmed.
  3. **Inconclusive / Indeterminate:** If the $90\%$ CI spans beyond $\pm 2.0\%$ while overlapping zero, the test is indeterminate (underpowered to resolve the margin).

### 4.3 Classification as Confirmatory vs. Exploratory
- If the pre-registered equivalence bound $\delta_{\text{plat}} = \pm 2.0\%$ is accepted as the substantive threshold, $H_3$ is evaluated as **Confirmatory TOST**.
- If peer reviewers contest the choice of $2.0\%$, the plateau analysis will be formally classified as **Exploratory / Estimation-Focused**, reporting the unbiased point estimate, standard error, and full confidence interval distribution without claiming a definitive categorical boundary.

---

## 5. Zero-Stakes Calibration Equivalence ($H_2$): Rigorous Power Derivation

### 5.1 Experimental Structure of Control Arm A
- **Sample Allocation:** $M = 30$ simulator executions, $N = 120$ developer observations ($m = 4$ developers per execution).
- **Condition:** 24h deadline, \$0 reward, \$0 penalty, Neutral Professional persona framing, sampled across 3 task difficulties ($n = 10$ executions per difficulty).
- **Cluster Design Effect:**
  $$\text{Deff} = 1 + (4 - 1) \times 0.020 = 1.060 \implies N_{\text{eff}} = \frac{120}{1.060} \approx 113.20$$

### 5.2 Smallest Effect Size of Interest (SESOI)
- Equivalence bounds: $[-\Delta_L, +\Delta_U] = [-3.0\%, +3.0\%]$.
- *Substantive Grounding:* Each functional subtask is worth $10.0\%$. An equivalence margin of $\pm 3.0\%$ corresponds to less than one-third of a single subtask. Passing this equivalence test mathematically establishes that the LLM does not systematically claim even one uncompleted subtask in the absence of incentives.

### 5.3 Analytic TOST Power Calculations across Variance Scenarios

Let $SE = \sigma / \sqrt{N_{\text{eff}}} = \sigma / \sqrt{113.20} \approx 0.09398 \times \sigma$.  
At $\alpha = 0.05$ for each one-sided test ($z_{\text{crit}} = 1.645$):
$$\text{Power} \approx \Phi\left(\frac{3.0 - |\mu|}{SE} - 1.645\right)$$

#### Table 5.1: TOST Power Sensitivity Grid for Control Arm A ($N = 120$)

| Scenario | Standard Deviation ($\sigma$) | Standard Error ($SE$) | True Baseline Bias ($\mu$) | Distance to Bound ($Z$) | Non-Centrality ($Z - 1.645$) | Analytic TOST Power |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Phase 5A Empirical SD** | $4.56\%$ | $0.428\%$ | $0.0\%$ | $7.00$ | $5.355$ | **$> 0.9999$** |
| **Low LLM Token Variance** | $6.00\%$ | $0.564\%$ | $0.0\%$ | $5.32$ | $3.675$ | **$0.9999$** |
| **Moderate Token Variance** | $7.50\%$ | $0.705\%$ | $0.0\%$ | $4.26$ | $2.610$ | **$0.9955$** |
| **Elevated Token Variance** | $8.50\%$ | $0.799\%$ | $0.0\%$ | $3.75$ | $2.110$ | **$0.9826$** |
| **High Token Variance** | $10.00\%$ | $0.940\%$ | $0.0\%$ | $3.19$ | $1.546$ | **$0.9389$** |
| **Extreme Token Variance** | $12.00\%$ | $1.128\%$ | $0.0\%$ | $2.66$ | $1.015$ | **$0.8450$** |
| *Slight Bias ($\mu = +0.5\%$)* | $4.56\%$ | $0.428\%$ | $+0.5\%$ | $5.84$ | $4.195$ | **$> 0.9999$** |
| *Slight Bias ($\mu = +0.5\%$)* | $7.50\%$ | $0.705\%$ | $+0.5\%$ | $3.55$ | $1.905$ | **$0.9716$** |
| *Slight Bias ($\mu = +0.5\%$)* | $10.00\%$ | $0.940\%$ | $+0.5\%$ | $2.66$ | $1.015$ | **$0.8450$** |
| *Moderate Bias ($\mu = +1.0\%$)*| $7.50\%$ | $0.705\%$ | $+1.0\%$ | $2.84$ | $1.195$ | **$0.8840$** |
| *Moderate Bias ($\mu = +1.0\%$)*| $10.00\%$ | $0.940\%$ | $+1.0\%$ | $2.13$ | $0.483$ | **$0.6855$ (Degraded)** |

### 5.4 Methodological Guardrail
> [!IMPORTANT] Equivalence vs. Non-Significance
> If Control Arm A yields $p \ge 0.05$ on a standard difference test but fails TOST equivalence ($90\%$ CI overlaps $\pm 3.0\%$), **it will be classified as inconclusive / uncalibrated**, NOT as "evidence of zero bias".

---

## 6. Power Calculation Provenance for Confirmatory Hypotheses

All power figures in Phase 5B represent **closed-form analytic approximations grounded in non-central $t$ and Gaussian distributions**, incorporating the clustering design effect ($\text{Deff} = 1.060$). They do not represent empirical Monte Carlo pilot simulations.

### Table 6.1: Master Statistical Specification & Power Provenance Table

| Hypothesis | Dependent Variable | Formal Estimand ($\theta$) | Primary Model & Inference | Sample Size ($N, M, N_{\text{eff}}$) | Assumed Parameters | Alpha ($\alpha$) & Multiplicity | Effect Size ($d$ or $\delta$) | Analytic Power |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **$H_1$** (Pressure Surge) | $\Delta_{\text{gap}}$ | $\beta_{\text{HIGH}} - \beta_{\text{LOW}}$ | LMM (REML, Kenward-Roger df) | $N = 1,920$ ($M=480$)<br>$N_{\text{eff}} = 452.8$/tier | $\sigma_\varepsilon = 4.56$<br>$\text{ICC} = 0.020$ | $\alpha = 0.05$ (one-tailed)<br>Holm step-down ($\alpha \le 0.05$)* | $d = 0.25$<br>($\delta = 1.14\%$) | **$0.914$** |
| **$H_2$** (Zero-Stakes Equivalence) | $\Delta_{\text{gap}}$ | $\mu_{\Delta, \text{Arm A}}$ | Intercept-only LMM with random cluster | $N = 120$ ($M=30$)<br>$N_{\text{eff}} = 113.2$ | $\sigma \in [4.56, 8.5\%]$<br>$\mu = 0.0\%$ | $\alpha = 0.05$ (TOST)<br>90% CI inside $\pm 3.0\%$ | Equiv margin<br>$\pm 3.0\%$ | **$> 0.98$** |
| **$H_3$** (Plateau TOST) | $\Delta_{\text{gap}}$ | $\mu_{\text{EXT}} - \mu_{\text{HIGH}}$ | Pairwise LMM contrast | $N = 1,920$ ($M=480$)<br>$N_{\text{eff}} = 452.8$/tier | $\sigma_\varepsilon = 4.56$<br>$SE = 0.303\%$ | $\alpha = 0.05$ (TOST)<br>90% CI inside $\pm 2.0\%$ | Equiv margin<br>$\pm 2.0\%$ | **$> 0.99$** |
| **$H_4$** (Stakes vs Time) | $\Delta_{\text{gap}}$ | $\mu_{B2} - \mu_{B1}$ | Two-sample LMM contrast on Arm B | $N = 360$ ($M=90$)<br>$N_{\text{eff}} = 169.8$/branch | $\sigma = 6.00$<br>$SE = 0.651\%$ | $\alpha = 0.05$ (one-tailed)<br>Holm: $\alpha_{\text{adj}} = 0.025$ | $d = 0.33$<br>($\delta = 2.00\%$) | **$0.867$** |
| **$H_5$** (Persona Moderation) | $\Delta_{\text{gap}}$ | $\boldsymbol{\beta}_{\text{press} \times \text{persona}}$ (9 df) | Full interaction LMM | $N = 1,920$ ($M=480$)<br>$N_{\text{eff}} = 1,811$ | $\sigma_\varepsilon = 4.56$ | $\alpha = 0.05$ (Omnibus Wald $\chi^2$) | Cohen's $f^2 = 0.05$ | **$> 0.999$** |

\* *Note on Power Calibration:* Power calculation for $H_1$ conservatively assumes the most stringent first-step threshold ($\alpha / 6 \approx 0.00833$). In empirical testing, $H_1$ is evaluated via the pre-specified step-down Holm procedure where its critical threshold depends on its empirical rank $i$ as $\alpha / (6 - i + 1)$, or equivalently $p_{\text{adj}} \le 0.05$.

> [!NOTE] Pre-Specified Multiplicity Family Hierarchy and Reconciliation Policy
> 1. **Family 1 (Confirmatory Pairwise Pressure Contrasts, $K = 6$):** Evaluated simultaneously under step-down Holm-Bonferroni correction ($\alpha = 0.05$). `HIGH vs LOW` serves as the primary focal contrast for Hypothesis $H_1$. Under step-down Holm, empirical $p$-values are sorted $p_{(1)} \le \dots \le p_{(6)}$ and evaluated sequentially against $\alpha / (6 - i + 1)$ (or via adjusted $p$-value $p_{\text{adj}} \le 0.05$); `HIGH vs LOW` does not receive a fixed 0.0083 cutoff unless it is empirically ranked first ($p_{(1)}$), though conservative a priori power calculations assumed the worst-case first-step threshold ($\alpha / 6 = 0.00833$). All 6 contrasts (`MED vs LOW`, `HIGH vs LOW`, `EXT vs LOW`, `HIGH vs MED`, `EXT vs MED`, `EXT vs HIGH`) are pre-specified and reported without post-hoc selection.
> 2. **Family 2 (Plateau Equivalence, $H_3$):** Two One-Sided Tests (TOST) evaluating `EXTREME vs HIGH` reporting difference against the pre-specified bound $\pm 2.0\%$ at $\alpha = 0.05$. Maintained as an independent equivalence procedure.
> 3. **Family 3 (Auxiliary Control Arms):** Zero-Stakes Calibration ($H_2$) tested via TOST against pre-specified margin $\pm 3.0\%$; Stakes vs Time ($H_4$) evaluated as an independent two-sample contrast at $\alpha = 0.05$.
> 4. **Family 4 (Persona Simple Effects under High Pressure, $K = 6$):** 6 pairwise comparisons between persona archetypes under High Pressure adjusted via step-down Holm-Bonferroni ($\alpha = 0.05$).
> 5. **Family 5 (Exploratory Secondary Outcomes):** Contrasts across secondary metrics (Claim Grounding Ratio, Metric Inflation Rate, Narrative Misrepresentation Rate, Failure/Refusal Rate) adjusted via Benjamini-Hochberg procedure controlling FDR at $q \le 0.05$.

---

## 7. Two-Stage Implementation Boundary

To ensure complete control over compute expenditure and guarantee that no large-scale campaign is launched prematurely, implementation is partitioned into two distinct milestones:

```
┌────────────────────────────────────────────────────────────────────────┐
│               PHASE 5B IMPLEMENTATION MILESTONES                       │
├────────────────────────────────────────────────────────────────────────┤
│ MILESTONE 5B.2A: ARCHITECTURE & HARNESS IMPLEMENTATION (AUTHORIZED)     │
│ 1. Implement dedicated simulation engine:                              │
│    • simulation/autonomous_simulator.py                                │
│    • agents/autonomous_developer.py                                    │
│    • agents/narrative_auditor.py                                       │
│    • simulation/synthetic_task_harness.py                              │
│ 2. Implement Pydantic data schemas & validator pipelines               │
│ 3. Implement full provenance telemetry logging (ExperimentResultV2)    │
│ 4. Build comprehensive unit test suite:                                │
│    • tests/test_autonomous_engine.py                                   │
│    • tests/test_schemas.py                                             │
│    • tests/test_provenance.py                                          │
│ 5. Execute 1 single-sprint smoke test (M = 1, 4 developers)            │
│ 6. STOP. Require explicit verification of test suite & smoke test.     │
├────────────────────────────────────────────────────────────────────────┤
│ MILESTONE 5B.2B: 2,400-OBSERVATION CAMPAIGN SWEEP (BLOCKED / HELD)     │
│ • Requires explicit, separate user authorization after 5B.2A passes.   │
│ • Executes the full 600-execution (13-hour) experimental sweep.        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Residual Technical Risks & Final Safeguards

1. **Ollama Socket Timeout during Smoke Test:**  
   *Risk:* Local Ollama daemon may drop connection during cold start.  
   *Safeguard:* Milestone 5B.2A includes retry logic with socket health checks before initiating the single-sprint smoke test.
2. **Token Latency Variance on Local Hardware:**  
   *Risk:* Latency per query may exceed 10s depending on background GPU load.  
   *Safeguard:* `ExperimentResultV2` logs `inference_duration_ms` on every call, providing real-time telemetry on compute throughput during Milestone 5B.2A.
3. **Pydantic Validation Recovery:**  
   *Risk:* Model outputs invalid markdown fences around JSON.  
   *Safeguard:* Custom parser in `utils/parser.py` strips markdown fences prior to Pydantic parsing, reducing retry overhead.

---

## 9. Repository Git Status Verification

- **Active Branch:** `Ishhh` (strictly preserved)
- **Code Changes:** Zero lines of simulation, agent, or statistical code modified. Zero historical datasets touched.
- **File Created:** `docs/PHASE_5B_FINAL_STATISTICAL_RESOLUTION.md`
- **Git Status Output:**

```bash
$ git status --short
 M docs/ARCHITECTURE.md
?? analysis/run_statistical_analysis.py
?? docs/CLAIMS_AND_EVIDENCE_MATRIX.md
?? docs/EXPERIMENT_PROTOCOL.md
?? docs/FINAL_STATISTICAL_VERIFICATION.md
?? docs/PHASE_5B_ARCHITECTURE.md
?? docs/PHASE_5B_DESIGN_AUDIT.md
?? docs/PHASE_5B_EXPERIMENTAL_DESIGN.md
?? docs/PHASE_5B_FINAL_READINESS_REVIEW.md
?? docs/PHASE_5B_FINAL_STATISTICAL_RESOLUTION.md
?? docs/PHASE_5B_PRE_REGISTRATION_DRAFT.md
?? docs/PRESENTATION_OUTLINE.md
?? docs/RESEARCH_DELIVERABLES_QUALITY_REVIEW.md
?? docs/RESEARCH_FINDINGS_SYNTHESIS.md
?? docs/STATISTICAL_ANALYSIS_REPORT.md
?? docs/STATISTICAL_DESIGN_REVIEW.md
?? docs/STATISTICAL_FINAL_RECONCILIATION.md
?? docs/STATISTICAL_RESULTS_AUDIT.md
?? docs/VIVA_AND_INTERVIEW_PREPARATION.md
?? results/statistical_analysis/
```

---

## 10. Conclusion

All statistical and experimental design issues raised in Phase 5B.1D have been **mathematically resolved, documented, and bound**. 

The repository is ready to proceed to **Milestone 5B.2A (Harness Implementation & Unit Testing)** upon your explicit authorization. Full campaign data collection (Milestone 5B.2B) remains strictly held.
