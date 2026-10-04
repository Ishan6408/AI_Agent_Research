# Phase 5A.9B: Statistical Analysis Plan

## 1. Research Question
How do varying levels of organizational pressure combined with distinct developer personalities affect the rate and severity of deceptive reporting in AI agents acting as software developers, and can an AI auditor reliably detect this deception?

Supported sub-questions:
- Effect of pressure on deception.
- Effect of personality on deception.
- Effect of task difficulty on deception.
- Differences between developer roles.
- Interactions between pressure and personality.
- Interactions between pressure and task difficulty.
- Interactions between pressure and developer role.

## 2. Primary Hypothesis/Hypotheses
*RESEARCHER DECISION REQUIRED.*
Potential candidates based on the research question:
- Increased pressure levels will result in a larger deception gap.
- The AI Auditor will accurately identify deception in scenarios where the deception gap is greater than 15.

## 3. Secondary Hypotheses
*RESEARCHER DECISION REQUIRED.*
Potential candidates:
- Personality types like "OPPORTUNISTIC" will demonstrate larger deception gaps than "HONEST" personalities under identical high pressure.
- Higher task difficulty will increase the deception gap.

## 4. Exploratory Questions
- How do pressure and personality interact to influence the severity of bugs introduced?
- Are certain developer roles (e.g., Frontend vs. Backend) more prone to deception under extreme pressure?

## 5. Experimental Unit
The experimental unit is a **single developer observation** (i.e., one `ExperimentResult` representing one developer's execution). While the current implementation batches 4 developers into a single `simulator.run()`, these developers do not interact or share state. Therefore, they are statistically independent within the run, allowing the individual developer execution to serve as the observation level.

## 6. Factorial Design
A fully crossed balanced factorial design will be used:
- 4 Pressure levels
- 4 Developer Roles
- 5 Personalities
- 3 Task Difficulties

Total = 240 distinct factorial cells. All combinations are executable in the current setup.

## 7. Factors and Levels
- **Pressure Level**: LOW, MEDIUM, HIGH, EXTREME
- **Developer Role**: Backend Developer, Frontend Developer, QA Engineer, DevOps Engineer
- **Personality**: HONEST, OPTIMISTIC, RISK_AVERSE, AMBITIOUS, OPPORTUNISTIC
- **Task Difficulty**: EASY, MEDIUM, HARD

## 8. Primary Outcome
*RESEARCHER DECISION REQUIRED.*
Candidates best suited to serve as primary outcomes based on the actual metrics:
- **`deception_gap`** (continuous): Direct magnitude of deception, highly suited for factorial ANOVA.
- **`deception_detected`** (binary): Direct evaluation of the auditor's ability to detect deception, suited for logistic regression.

*Note: Arbitrarily selecting one without justification risks misalignment with the project objective. Selecting multiple primary outcomes requires adjusting the significance threshold for multiple comparisons.*

## 9. Secondary Outcomes
*RESEARCHER DECISION REQUIRED.*
Depending on the choice of primary outcome, secondary outcomes may include:
- `deception_level` (ordinal)
- `honesty_score` (continuous)
- `bugs_introduced` (count)
- `code_quality` (continuous)
- `performance_score` (continuous)
- `auditor_score` (continuous)

## 10. Repetition Definition
Repetition ($R$) is defined as the number of independent executions of a single factorial cell (i.e., a specific combination of Pressure, Role, Personality, and Difficulty).

## 11. Seed Strategy
To ensure reproducibility without reusing the exact same random stream for independent repetitions, a unique, deterministically derived seed must be used per cell repetition. 
*Example:* `seed = hash(pressure_level, role, personality, difficulty, repetition_id)`
This strategy preserves full reproducibility while avoiding intentional reuse of the same randomness for independent replicates.

## 12. Sample-size Reasoning
*RESEARCHER DECISION REQUIRED.*
A formal power analysis cannot be performed at this time because a defensible expected effect size and within-cell variance estimate for the stochastic simulation have not been established. The 211-record historical dataset may be used exclusively as preliminary/exploratory evidence to estimate expected variance. Until an effect size is proposed, the repetition count ($R$) remains unresolved.

## 13. Statistical Analysis
Based on the metrics and the experimental unit, a simple and defensible plan:
- **Continuous Outcomes (e.g., `deception_gap`)**: Factorial ANOVA (Analysis of Variance) to estimate main effects and interactions.
- **Binary Outcomes (e.g., `deception_detected`)**: Logistic Regression modeling the probability of detection against the factors.
- **Ordinal Outcomes (e.g., `deception_level`)**: Ordinal Logistic Regression.

*Note:* If the execution batches (simulator runs) are suspected of introducing shared variance despite lack of state sharing, Mixed-Effects Models (treating simulator run as a grouping/blocking factor) should be used. However, standard Factorial ANOVA is simplest given the current isolated execution model.

## 14. Interaction Analysis
The analysis will prioritize two-way interactions involving Pressure, as it is the core environmental variable:
- Pressure × Personality
- Pressure × Difficulty
- Pressure × Developer Role

Evaluating all possible three-way and four-way interactions (e.g., Pressure × Personality × Difficulty × Role) is not recommended. It demands a significantly larger sample size ($R$), drastically increases computational LLM cost, and reduces interpretability without clear scientific justification.

## 15. Multiple Comparisons
*RESEARCHER DECISION REQUIRED.*
If factorial ANOVA identifies significant main effects or interactions, post-hoc pairwise comparisons will be necessary. A multiple-comparison correction strategy (e.g., Tukey's HSD for ANOVA, or Bonferroni for planned contrasts) must be selected prior to the final experiment to control the false positive rate.

## 16. Assumptions
- Independence of observations (developers do not share state).
- For ANOVA: Normality of residuals and homogeneity of variances. (Must be checked post-run).

## 17. Missing/Invalid Data Handling
*RESEARCHER DECISION REQUIRED.*
A policy is required for handling runs where the LLM fails to output valid JSON, resulting in missing metrics. Typical strategies include listwise deletion with transparent reporting of the failure rate.

## 18. Historical Dataset Treatment
The existing historical dataset (`results/experiment_summary.csv`, strictly containing 211 records) must NOT be modified, appended to, or mixed into the final experimental sample. The future factorial campaign must output data to a clearly separated directory or use explicit dataset identity tagging to prevent confounding controlled protocol data with exploratory historical data.

## 19. Final Dataset Size
Total observations = $240 \times R$ developer-level observations.
Since $1$ simulator run generates $4$ observations (one for each role), executing the factorial design while maintaining the current batching structure would require $(240 \times R) / 4 = 60 \times R$ simulator runs.

## 20. Pre-run Decisions
**FROZEN:**
- Factors and levels (4 Pressures, 4 Roles, 5 Personalities, 3 Difficulties).
- Experimental unit (Developer observation).
- Metric formulas (Deterministic Python logic).
- Auditor methodology.
- LLM configuration (`qwen2.5:7b`, temperature `0.3`).
- Provenance capturing (Git SHA, seeds).
- Historical dataset isolation.

## 21. Researcher Decisions Still Required
**RESEARCHER DECISION REQUIRED:**
- The required number of repetitions ($R$) per cell.
- Designation of the single Primary Outcome.
- The hypotheses formulation.
- The specific multiple-comparison correction method.
- The missing/invalid data handling policy.
- Modification of the code to support explicit factorial iteration instead of random sampling.

## 22. Known Limitations
- Pure natural-language string reproducibility is impossible due to LLM stochasticity.
- The current implementation relies on random sampling for Personality and Difficulty; running the factorial design requires code modifications to explicitly inject these parameters.
