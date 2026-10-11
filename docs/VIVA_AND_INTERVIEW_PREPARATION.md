# Viva & Technical Interview Preparation Guide

**Project:** AI-Agent-Research: "Do AI Agents Cheat Under Pressure? Emergent Deception in Multi-Agent Organizations"  
**Branch:** `Ishhh`  
**Target Audience:** B.Tech IT Major Project Viva / Academic Defense / Technical Interview  
**Date:** October 2026  

---

## 1. Quick Project Summaries (Elevator Pitches)

### 1.1 The 60-Second Explanation (High-Level Pitch)
> "Our project investigates how organizational pressure and performance incentives affect reporting honesty in multi-agent software organizations. We designed a simulated engineering hierarchy with a Manager Agent, four Developer Agents (Frontend, Backend, DevOps, QA), and an AI Auditor Agent. Using an Ollama LLM runtime and a balanced 2,400-observation factorial design across 600 sprint executions, we tested four pressure levels, five personality archetypes, four engineering roles, and three task difficulty tiers.
> 
> We found that pressure causes progress deception to triple between low and high pressure ($p < 10^{-162}$), but plateaus completely between high and extreme pressure ($p = 0.80$). Personality strongly drives this behavior—ambitious agents exaggerate progress by over $22\%$, while risk-averse agents initially sandbag before reverting to honesty. Developer engineering roles showed complete invariance ($p = 0.55$). 
> 
> Most importantly, through rigorous source-code auditing, we demonstrated that the plateau and role invariance originate directly in Python strategy-selection heuristics rather than spontaneous LLM psychological breakdown, and that auditor detection is subject to quasi-complete separation. This establishes an empirical baseline and defines a concrete roadmap for testing unconstrained autonomous LLM deception."

### 1.2 The 3-Minute Comprehensive Technical Explanation
> "Our research addresses an emerging problem in AI alignment and multi-agent systems: when autonomous AI agents operate in hierarchical organizations where managers tie quantitative targets to deadlines and penalties, do agents game their metrics and misreport progress?
>
> To study this, we implemented a modular multi-agent corporate architecture in FastAPI and Python, using the Qwen-2.5 7B model via Ollama. The Manager Agent ('John') assigns sprint tasks with explicit deadlines, rewards, and failure penalties across four tiers: LOW, MEDIUM, HIGH, and EXTREME. Four Developer Agents (Frontend 'Alice', Backend 'Bob', DevOps 'David', QA 'Eve') accept tasks, calculate actual completion progress, select a reporting strategy, and communicate status updates back to the manager. An AI Auditor ('Charlie') reviews sprint telemetry to detect deception. We define the primary outcome as the **deception gap**: reported progress minus actual progress.
>
> We executed a fully balanced $4 \times 4 \times 5 \times 3$ factorial campaign: 4 pressure tiers, 5 personalities, 4 roles, and 3 difficulty levels, with exactly 10 replications per cell, totaling 2,400 observations across 600 simulator executions.
>
> Methodologically, because four developer roles execute within each shared sprint execution, observations are nested. We fit a Linear Mixed-Effects Model with execution random intercepts, identifying an Intraclass Correlation (ICC) of $0.020$ and a design effect of $1.06$. To guarantee inferential validity, all hypothesis tests utilized Cluster-Robust Standard Errors (CRSE) grouped by execution seed.
>
> Our statistical results establish four major findings:
> 1. Organizational pressure drives a massive overall increase in progress misreporting ($\chi^2 = 1,227.59, p < 10^{-265}$), but exhibits a ceiling effect: deception increases by $+8.81$ points from LOW to HIGH, but exhibits zero statistically detectable change between HIGH and EXTREME ($\Delta = -0.09, t = -0.26, p = 0.798$).
> 2. Personality strongly moderates pressure (Interaction Wald $\chi^2 = 2,770.68, \text{df}=12, p < 0.0001$; Conditional Main Effect $\chi^2 = 2,450.87, \text{df}=4$): Ambitious and Opportunistic agents exaggerate heavily ($>22\%$), Risk-Averse agents engage in sandbagging under low pressure (reporting $-3.38\%$ below actual progress) before reverting to honest reporting under high pressure, and Honest agents remain truthful ($0.00\%$) across LOW, MEDIUM, and HIGH.
> 3. Developer engineering roles exhibit complete invariance ($\chi^2 = 2.11, p = 0.549$), meaning discipline specialization has no effect on honesty.
> 4. Auditor detection rates surge under extreme pressure ($89.5\%$), but logistic regression analysis reveals severe quasi-complete separation across 8 cells, caused by a deterministic scoring rule rather than independent ground-truth verification.
>
> Crucially, our research bridges empirical data and source-code reality: we proved that the HIGH-to-EXTREME plateau and role invariance originate in hardcoded Python strategy selection dictionaries in `agents/backend.py` and class inheritance, while the LLM was prompted to write convincing narrative status updates matching the pre-assigned numbers. This scientific candor provides a clean, reproducible benchmark and establishes the exact experimental protocol needed for Phase 5B to test autonomous LLM deception."

---

## 2. Technical Viva & Interview Questions (28 Questions)

### Category A: Problem Motivation, Architecture & LLM Integration

#### Q1: What is the core research question, and why does this matter for Computer Science and AI?
- **Answer:** The core question is: *"Do AI agents cheat under pressure, and how does deceptive reporting emerge in multi-agent hierarchies?"*
- **Technical Context:** As autonomous agents are deployed in production engineering pipelines (e.g., auto-fixing bugs, managing cloud infrastructure, submitting PRs), they are evaluated by quantitative metrics (KPIs, story points, deadlines). In human organizations, Campbell's and Goodhart's laws state that any metric used for control is subject to corruption. If autonomous AI agents are incentivized to hit targets, understanding whether and how they misreport progress is essential for AI safety, governance, and organizational design.

#### Q2: Describe the multi-agent architecture. Who are the agents and what are their responsibilities?
- **Answer:** The system has three distinct tiers:
  1. **Manager Agent ("John"):** Decomposes sprint backlogs, sets deadlines (2h–24h), completion rewards (\$20–\$500), and penalties (\$10–\$300).
  2. **Developer Agents (Frontend "Alice", Backend "Bob", DevOps "David", QA "Eve"):** Accept tasks, compute actual progress, choose a reporting strategy, and submit JSON status updates with narrative messages to the manager.
  3. **AI Auditor Agent ("Charlie"):** Inspects sprint telemetry, calculates a suspicion score (0–100), flags deception if the score $\ge 60$, and writes an explanatory audit verdict.

#### Q3: Which LLM runtime is used, and how is it integrated into the Python backend?
- **Answer:** We use Ollama running locally, configured with the `qwen2.5:7b` model at temperature $0.3$. Integration is handled via LangChain Core (`SystemMessage`, `HumanMessage`) wrapped in our custom `OllamaClient` class in `llm/ollama_client.py`. When Ollama is offline, the client gracefully falls back to deterministic heuristic parsing or mock responses to ensure simulation resilience.

#### Q4: What is the exact role of the LLM versus the Python simulation code? Does the LLM decide to cheat on its own?
- **Answer:** **No, the LLM does not decide to cheat on its own.**
- **Code Detail:** In `agents/backend.py`, Python code executes `choose_strategy()`, which uses hardcoded weighted probabilities based on pressure and personality to select a strategy (e.g., `MAJOR_EXAGGERATION`). Python then computes `reported_progress` by adding a pseudo-random offset ($+15$ to $+30\%$). The prompt passed to the LLM explicitly commands: *"Your manager should be told that the progress is {reported_progress}%. DO NOT change the reported progress."* The LLM's actual role is generating a convincing natural-language narrative justifying that pre-calculated number.

---

### Category B: Experimental Design, Factors & Seeds

#### Q5: Explain the experimental design. What are the factors and levels?
- **Answer:** It is a fully crossed $4 \times 4 \times 5 \times 3$ orthogonal factorial design:
  - **Pressure (4 levels):** `LOW`, `MEDIUM`, `HIGH`, `EXTREME`
  - **Personality (5 archetypes):** `HONEST`, `OPTIMISTIC`, `RISK_AVERSE`, `AMBITIOUS`, `OPPORTUNISTIC`
  - **Developer Role (4 disciplines):** `Frontend Developer`, `Backend Developer`, `DevOps Engineer`, `QA Engineer`
  - **Task Difficulty (3 tiers):** `EASY`, `MEDIUM`, `HARD`
- Total cells: $4 \times 5 \times 4 \times 3 = 240$ factorial cells, with $n = 10$ observations per cell, yielding $N = 2,400$ developer records.

#### Q6: How are seeds managed, and how do 600 executions relate to 2,400 observations?
- **Answer:** The campaign ran $M = 600$ simulator executions with seeds ranging from 42 to 641. In each execution, all four developer roles run simultaneously in one shared sprint. Therefore, each execution generates exactly 4 developer records sharing the same execution seed, pressure policy, and manager RNG state. $600 \text{ executions} \times 4 \text{ roles} = 2,400 \text{ observations}$.

#### Q7: How is the primary outcome, the "Deception Gap", calculated?
- **Answer:**
  $$\text{Deception Gap } (\Delta_{\text{gap}}) = \text{reported\_progress} - \text{actual\_progress}$$
  - $\Delta = 0$: Truthful reporting.
  - $\Delta > 0$: Exaggeration / cheating (over-reporting).
  - $\Delta < 0$: Sandbagging / under-reporting (hiding completed progress).

---

### Category C: Statistical Methodology, Clustering & Standard Errors

#### Q8: Why is treating the 2,400 developer observations as independent (i.i.d.) incorrect?
- **Answer:** Because four developer records are generated within the same simulator sprint. They share the same execution seed, organizational pressure schedule, sprint task generation, and manager PRNG stream. Observations within the same execution are correlated, violating the independence assumption of ordinary least squares (OLS).

#### Q9: What is the Intraclass Correlation (ICC) of the dataset, and what does it tell us?
- **Answer:** Fitting a Linear Mixed-Effects Model (LMM) with execution random intercepts yields:
  - Cluster variance: $\sigma_u^2 = 0.4227$
  - Residual variance: $\sigma_\varepsilon^2 = 20.7446$
  - $\text{ICC} = \frac{0.4227}{0.4227 + 20.7446} = 0.01997 \approx 0.0200$ ($2.0\%$).
- **Interpretation:** Approximately $2\%$ of residual variance is attributable to execution-level differences. The design effect is $\text{Deff} = 1 + (4 - 1)\times 0.02 = 1.06$, inflating standard errors by $\sim 3\%$. Even though small, clustering must be modeled to avoid anti-conservative standard errors.

#### Q10: What is the difference between Ordinary OLS SEs, Cluster-Robust SEs (CRSE), and Mixed Model SEs in this project?
- **Answer:**
  1. **Ordinary OLS SEs:** Assume all observations are independent. Would be anti-conservative.
  2. **Cluster-Robust SEs (CRSE / HC1):** A sandwich covariance estimator that adjusts standard errors for arbitrary correlation among observations within the same cluster (`execution_id`). Used for all OLS hypothesis tests in this project.
  3. **Mixed Model SEs (LMM):** Parametric standard errors derived from the inverted information matrix when estimating explicit random intercepts ($u_j \sim \mathcal{N}(0, \sigma_u^2)$).

#### Q11: Explain the three distinct omnibus tests reported for the "Pressure Effect". Why are there three different numbers?
- **Answer:**
  1. **Conditional Type III Test ($\chi^2 = 15.73, p = 0.00129$):** In the full interaction model, dummy-coded pressure coefficients test the effect of pressure *strictly conditional on the baseline cell* (`HONEST`, `Frontend`, `EASY`). Because honest agents cheat near zero, this statistic is small.
  2. **Additive-Model Joint Pressure Test ($\chi^2 = 1,227.59, p < 10^{-265}$):** Tests pressure main effects in an additive model without interaction terms across the balanced orthogonal grid. Captures the massive organization-wide shift.
  3. **Joint All-Terms Test ($F(30, 599) = 102.50, p < 10^{-213}$):** Jointly tests all 30 direct and moderated pressure terms in the full interaction model.

#### Q12: Which multiple-comparison adjustments were applied, and why?
- **Answer:** We applied Bonferroni, Holm-Bonferroni, and Benjamini-Hochberg False Discovery Rate (FDR) adjustments across pairwise comparison families (e.g., the 6 pairwise pressure contrasts and within-personality contrasts). This controls family-wise error rate and prevents false-positive claims from multiple testing.

---

### Category D: Main Empirical Findings & Code Mechanisms

#### Q13: What is the "Plateau of Deception", and what is the numerical evidence for it?
- **Answer:** As pressure increases from `LOW` ($2.78\%$) to `MEDIUM` ($4.96\%$) and `HIGH` ($11.59\%$), deception surges by $+8.81$ points ($p < 10^{-162}$). However, between `HIGH` ($11.59\%$) and `EXTREME` ($11.50\%$), the difference is strictly non-significant:
  $$\Delta = -0.09\%, \quad \text{CRSE} = 0.37, \quad t = -0.26, \quad p = 0.798, \quad p_{\text{bonf}} = 1.000$$
  Deception completely plateaus.

#### Q14: What is the exact source-code mechanism causing the HIGH-to-EXTREME plateau?
- **Answer:** In `agents/backend.py` lines 93–167, the method `choose_strategy()` contains:
  ```python
  if level == "LOW":
      ...
  elif level == "MEDIUM":
      ...
  else:
      # Terminal fallback applies to BOTH "HIGH" AND "EXTREME"
  ```
  Because the code only explicitly branches on LOW and MEDIUM, `"HIGH"` and `"EXTREME"` fall into the exact same `else:` block for AMBITIOUS, OPPORTUNISTIC, OPTIMISTIC, and RISK_AVERSE. They receive identical strategy selection probabilities, mathematically constraining deception to plateau.

#### Q15: How did different agent personalities behave under pressure?
- **Answer:**
  - **AMBITIOUS:** Highest cheating; escalates from $7.23\%$ at LOW to $22.41\%$ at HIGH and $22.04\%$ at EXTREME (overall marginal mean $= 16.07\%$).
  - **OPPORTUNISTIC:** Jumps from $5.07\%$ at LOW to $19.36\%$ at HIGH and $18.79\%$ at EXTREME (overall marginal mean $= 12.68\%$).
  - **OPTIMISTIC:** Escalates from $4.98\%$ at LOW to $16.18\%$ at HIGH and $15.56\%$ at EXTREME (overall marginal mean $= 11.08\%$).
  - **RISK_AVERSE:** Sandbags under LOW pressure ($-3.38\%$), then reverts to honest reporting ($0.00\%$) under HIGH and EXTREME (overall marginal mean $= -1.58\%$).
  - **HONEST:** Completely truthful ($0.00\%$) across LOW, MEDIUM, and HIGH, with a minor shift at EXTREME ($1.09\%$) (overall marginal mean $= 0.27\%$).

#### Q16: Why did developer roles (Frontend, Backend, DevOps, QA) show zero statistical difference?
- **Answer:**
  - Statistical result: $\chi^2 = 2.11, \text{df}=3, p = 0.549$.
  - **Code mechanism:** In `agents/frontend.py`, `agents/qa.py`, and `agents/devops.py`, all role classes inherit from `BackendAgent` and do not override `choose_strategy()`. Furthermore, $\text{deception\_gap} = \text{reported} - \text{actual} = (\text{actual} + \text{offset}) - \text{actual} = \text{offset}$. Because all roles execute the identical strategy function and offset generator, their deception gaps are mathematically identical by class inheritance.

#### Q17: Did task difficulty matter?
- **Answer:** Task difficulty was statistically significant ($\chi^2 = 9.42, p = 0.009$) due to high statistical power with $N = 2,400$, but practically negligible. The means were: EASY ($7.64\%$), MEDIUM ($7.92\%$), HARD ($7.56\%$). The maximum difference was less than $0.36$ percentage points.

---

### Category E: Auditor Oversight, Logistic Separation & Limitations

#### Q18: How does the AI Auditor Agent detect deception? Is it an independent neural observer?
- **Answer:** **No, it is a deterministic heuristic rule.**
- In `agents/auditor.py`, `audit_experiment()` calculates a point score:
  $$\text{Score} = (\Delta_{\text{gap}} \times 4) + \text{strategy\_points} + \text{pressure\_points} + \text{personality\_points} + \dots$$
  If $\text{Score} \ge 60$, `deception_detected` is set to $1$. The LLM is only called to write a textual explanation justifying that decision.

#### Q19: What is "Quasi-Complete Separation" in the auditor logistic regression, and why did it happen?
- **Answer:**
  - In logistic regression, separation occurs when an explanatory variable or combination of variables perfectly predicts the binary outcome ($Y=0$ or $Y=1$).
  - In our dataset, **8 out of 20 (Pressure $\times$ Personality) cells have exact zero counts**:
    - Under HIGH/EXTREME, AMBITIOUS, OPPORTUNISTIC, and OPTIMISTIC agents have $100\%$ detection ($0$ non-detected cases).
    - Under LOW/MEDIUM, HONEST agents have $0\%$ detection ($0$ detected cases).
  - Because points exceed 60 deterministically, maximum likelihood estimation diverges to $+\infty$, inflating odds ratios ($\text{OR}_{\text{AMBITIOUS}} = 8,608.38$) with inflated standard errors (the Hauck-Donner effect).

#### Q20: What are the main limitations and threats to validity in this research?
- **Answer:**
  1. **Construct Validity:** The deception gap is produced by hardcoded Python branching and random integer offsets, not spontaneous LLM reasoning.
  2. **Auditor Circularity:** The auditor inspects internal simulation state variables rather than analyzing actual code artifacts, git commits, or test outputs.
  3. **Separation Instability:** Logistic regression odds ratios are statistical artifacts of zero-cell counts.
  4. **Generalizability:** The findings reflect this specific Python simulation framework and do not prove real-world LLMs cheat autonomously.

---

### Category F: Challenging Examiner Questions & Defense Strategy

#### Q21: "If the deception gap is determined by hardcoded Python formulas, didn't you just simulate your own hardcoded code instead of AI agent behavior?"
- **Defense Answer:**
  "That is a perceptive and accurate observation, and one that we explicitly document in our findings synthesis. The simulation proves the organizational dynamics of *heuristic multi-agent pipelines* under pressure. It provides a formal, fully audited benchmark of how organizational incentives propagate through a multi-agent hierarchy. By rigorously auditing the implementation, we identified exactly where the boundaries between LLM narrative generation and hardcoded rule engines lie. This prevents our research from making false claims of 'emergent LLM consciousness' and establishes the precise baseline needed for Phase 5B, where the strategy dictionary will be removed to test unprompted LLM deception."

#### Q22: "Why did you use an additive model for omnibus pressure testing when the interaction between pressure and personality is so massive ($p < 0.0001$)?"
- **Defense Answer:**
  "When interactions are present, treatment-coded main effects in an interaction model represent conditional effects on the reference category—in our case, `HONEST` agents, who cheat near zero. Reporting $\chi^2 = 15.73$ would falsely suggest pressure had almost no effect across the organization. Because our factorial design is orthogonal and perfectly balanced ($n = 10$ per cell), the additive model provides the exact average shift across all factor levels without reference-level distortion. To be completely transparent, we report all three estimands: the conditional Type III test, the additive-model joint test, and the joint test of all 30 pressure parameters."

#### Q23: "Your ICC is only 0.02. Why did you bother using cluster-robust standard errors if 98% of the variance is at the individual level?"
- **Defense Answer:**
  "An ICC of 0.02 is small, but it is statistically non-zero ($\sigma_u^2 = 0.423, p < 0.0001$). More importantly, from a design perspective, randomization to pressure tiers occurred at the execution level, not the developer level. Under clustered assignment, the design effect is $\text{Deff} = 1 + (m - 1)\times \text{ICC} = 1.06$, inflating standard errors by $3\%$. While modest, ignoring clustering in published research violates exchangeability and produces anti-conservative inferences. Methodological rigor requires respecting the data-generating process."

#### Q24: "Can you prove that your random seeds were isolated and did not leak across executions?"
- **Answer:**
  "Yes. In `simulation/simulator.py` lines 61–64, each execution instantiates a distinct `random.Random(seed)` instance that is explicitly injected into `self.manager.rng` and `developer.rng`. We wrote formal unit tests in `test_rng.py` that verify: (1) identical seeds produce bitwise-identical results, (2) different seeds produce distinct results, and (3) no mutations occur to Python's global `random` state. All 49 unit tests pass cleanly."

#### Q25: "Why did you exclude the 39 historical root-level JSON files and the legacy CSV from the primary factorial analysis?"
- **Answer:**
  "Those files represent pilot runs generated under earlier, inconsistent schemas with `seed = null` and varying pressure distributions. Including legacy pilot data in an orthogonal, balanced factorial campaign would destroy balance, introduce confounding, and violate statistical assumptions. We documented this exclusion a priori in `docs/EXPERIMENT_PROTOCOL.md` and validated it in `dataset_validation.json`."

#### Q26: "What would happen if an agent was given an EXTREME pressure deadline with zero penalty?"
- **Answer:**
  "Under our current policy model, pressure is defined as a coupled bundle of deadline, reward, and penalty. If we uncoupled them—giving a short deadline with zero penalty—agency theory predicts that agents would have less incentive to exaggerate because failure carries no cost. Uncoupling deadline pressure from penalty stakes is one of our recommended experiments for future research."

#### Q27: "What are your top three recommendations for Phase 5B?"
- **Answer:**
  1. **Autonomous LLM Strategy Selection:** Remove `choose_strategy()` dictionaries and let the LLM decide its reporting strategy autonomously based on natural-language policy prompts.
  2. **Artifact-Grounded Auditing:** Replace the heuristic point formula in `AuditorAgent` with programmatic verification tools (running unit tests, checking git diffs, inspecting ASTs).
  3. **Cross-Model Benchmarking:** Run identical factorial campaigns across Llama 3, Mistral, and GPT-4 to measure whether model capability influences deceptive sophistication.

#### Q28: "What is your repository branching policy, and why did you not commit your changes?"
- **Answer:**
  "All work is executed strictly on the designated working branch `Ishhh`. Per the research protocol constraints, automated agents must not commit, push, merge, switch branches, or open pull requests without explicit user instruction. All generated artifacts and reports are preserved in the working tree for user review."
