# Phase 5A.14: Statistical Results Review

## 1. Executive Summary
This document provides a comprehensive statistical review of the first-pass analysis of the final campaign data. The final campaign successfully produced 2,400 observations across 600 independent simulator runs. The primary goal of this review was to verify statistical plan compliance, experimental grouping structures, interaction interpretations, and assumption checks. The review found that the first-pass Ordinary Least Squares (OLS) analysis successfully executed the planned factorial variables but contained a severe methodological flaw regarding experimental unit independence by ignoring execution-level grouping. This flaw artificially inflates degrees of freedom for the primary effect, requiring a follow-up analysis using mixed-effects modeling or cluster-robust standard errors.

## 2. Materials Reviewed
- `docs/PHASE_5A_9B_STATISTICAL_ANALYSIS_PLAN.md`
- `docs/PHASE_5A_10A_FACTORIAL_ARCHITECTURE_DECISION.md`
- `docs/PHASE_5A_12_FINAL_CAMPAIGN_DATASET_INTEGRITY_AUDIT.md`
- `analysis/final_campaign/FINAL_STATISTICAL_ANALYSIS.md`
- `run_analysis.py`
- Generated statistical CSVs (e.g., `pairwise_pressure_comparisons.csv`, `detection_rates.csv`, `model_results.csv`)

## 3. Statistical Plan Compliance
- **Formula matched**: Yes. The ANOVA implemented (`deception_gap ~ C(pressure) + C(personality) + C(task_difficulty) + C(developer_role) + C(pressure):C(personality) + C(pressure):C(task_difficulty) + C(pressure):C(developer_role)`) perfectly matches the intended main effects and two-way interactions involving Pressure specified in Phase 5A.9B.
- **Primary outcome used**: Yes, `deception_gap`.
- **Deviation**: The plan suggested considering standard Factorial ANOVA as acceptable due to isolated developer state, but also explicitly noted that Mixed-Effects Models should be used if shared variance from batching was a concern. The first-pass analysis opted for simple OLS without adjusting for the 600 simulator groupings.

## 4. Model Specification Review
The `run_analysis.py` script correctly utilizes `statsmodels.formula.api.ols` to fit the OLS regression and compute a Type 2 ANOVA table. The logistic regression appropriately predicts `deception_detected` against `pressure`.

## 5. Independence / Execution-Grouping Review
- **Flaw Detected**: The 2,400 observations come from exactly 600 simulator executions.
- By design (per Phase 5A.10A Option A), 4 developer observations are generated per execution, sharing a single base random seed.
- More importantly, **Pressure is assigned at the simulator run level** (150 runs per pressure, so all 4 developers in one execution experience the identical Pressure level).
- Because Pressure is a whole-plot (execution-level) factor, treating all 2,400 observations as independent for the main effect of Pressure drastically inflates the degrees of freedom (treating N=2400 instead of N=600 for the main effect). This underestimates standard errors and yields artificially tiny p-values.
- **Finding**: A sensitivity analysis using a mixed-effects model (with `seed` or execution run ID as a random intercept) or cluster-robust standard errors is absolutely required to fix the pseudoreplication.

## 6. Primary Outcome Review
- **Reported Pattern**: LOW → MEDIUM → HIGH → EXTREME.
- **Verification**: The `pairwise_pressure_comparisons.csv` demonstrates EXTREME vs HIGH has a mean difference of 0.0933 and a Tukey's p-adjusted value of 0.9978.
- **Correction**: The pattern is actually LOW < MEDIUM < HIGH ≈ EXTREME. The apparent plateau between HIGH and EXTREME is highly statistically supported (p=0.9978, meaning they are indistinguishable). The report's claim that HIGH is the "highest" is technically true numerically (11.59 vs 11.49) but scientifically misleading, as the relevant statistical comparison proves a plateau.

## 7. Pressure × Personality Review
- **Verification**: The interaction model yields p = 3.497e-132, which is correctly interpreted as highly statistically significant in the report.

## 8. Pressure × Difficulty Review
- **Verification**: The interaction yields p = 0.174, correctly interpreted as not significant.

## 9. Pressure × Role Review
- **Verification**: The interaction yields p = 0.0717, correctly interpreted as not significant at alpha = 0.05.

## 10. Multiple-Comparison Review
- **Implementation Checked**: `run_analysis.py` successfully uses `pairwise_tukeyhsd()` from `statsmodels.stats.multicomp`, applying Tukey's Honestly Significant Difference.
- **Verification**: Post-hoc pairwise corrections were properly calculated and generated.

## 11. Auditor Detection Review
- **Implementation Checked**: Detection rates were calculated independently of the main deception gap ANOVA. A logistic regression was run (`logit('deception_detected ~ C(pressure)')`) to generate detection probabilities and confidence intervals.
- **Interpretation Alert**: The detection rate rises with pressure (from 42.5% to 89.5%). This does not prove the auditor is "better" at EXTREME pressure; rather, it implies that deceptive behavior is more blatant or frequent at higher pressures, making it easier to trigger the auditor's deterministic thresholds.

## 12. Assumption Review
- **Implementation Checked**: The first-pass script mechanically relied on the Central Limit Theorem without checking residual distributions or plotting for homoscedasticity.
- **Verification**: While OLS is generally robust, ignoring execution-level grouping violates the fundamental assumption of independence of errors, which requires immediate remediation.

## 13. LLM Reproducibility Wording Review
- **Flaw Detected**: The first-pass report states: "Temperature 0.3 means LLM outputs are relatively deterministic...".
- **Verification**: This severely contradicts prior Phase 5A.8 findings, which definitively established that local LLMs (`qwen2.5:7b`) are not perfectly deterministic even with identical seeds and low temperatures. This wording must be revised to acknowledge stochasticity appropriately.

## 14. Data Integrity Verification
- `git status` confirmed no modifications to `results/factorial_campaign/*.json` or historical datasets.
- No files were deleted, rerun, or improperly altered during this audit. The integrity of the 2,400 JSON files and 211 historical CSV records is fully preserved.

## 15. Findings
- **[BLOCKING] Execution Grouping Violation**: The OLS analysis treats N=2400 as independent, ignoring the 600-execution clustering, inflating degrees of freedom for the Pressure effect.
- **[HIGH] Misleading Plateau Interpretation**: The report claims HIGH is the "highest" without noting it is statistically tied with EXTREME (p=0.9978), obscuring the most critical plateau finding.
- **[MEDIUM] Reproducibility Wording**: The claim that temp=0.3 is "relatively deterministic" contradicts previous reproducibility audits.
- **[LOW] Assumption Checks Missing**: No formal plots or tests of residuals.
- **[OBSERVATION] Auditor Rates Interpretation**: Higher detection at EXTREME pressure simply reflects higher blatancy of deception, not improved auditor intelligence (as it is a static rule-based system).

## 16. Required follow-up actions
1. Re-run the statistical model using a Mixed-Effects Model (e.g., `statsmodels.regression.mixed_linear_model.MixedLM`) or cluster-robust standard errors grouping by simulator execution seed.
2. Update the report's text to explicitly describe the HIGH ≈ EXTREME plateau based on Tukey's HSD.
3. Correct the LLM reproducibility wording to reflect known stochastic behavior.

## 17. Final verdict
**NOT READY FOR CONCLUSIONS / PRESENTATION.**
The current analysis is statistically inadequate due to the execution-level grouping violation (pseudoreplication) and the misleading interpretation of the HIGH/EXTREME plateau. A follow-up statistical analysis phase is required to correct the model and generate valid standard errors before finalizing the results.
