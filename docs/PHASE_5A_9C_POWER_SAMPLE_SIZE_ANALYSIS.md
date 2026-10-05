# Phase 5A.9C: Preliminary Power and Sample-Size Analysis

## 1. Purpose
This document presents a preliminary statistical power and sample-size analysis to determine the optimal repetition count ($R$) for the planned balanced factorial experiment (Phase 5A.10). It uses the existing 211-record historical dataset purely as exploratory evidence to estimate plausible variance and effect-size ranges.

## 2. Historical Dataset Limitations
The historical dataset (`results/experiment_summary.csv`, $N=211$) was generated under an unbalanced, stochastic sampling design. 
- It is **not** a balanced factorial sample.
- It will **not** be combined with future factorial observations.
- It does **not** serve as confirmatory proof of any final hypotheses.
- Results derived here are strictly PRELIMINARY EFFECT-SIZE ESTIMATES from historical data.

## 3. Historical Data Summary
An inspection of the 211 records reveals:
- **Total Records:** 211
- **Missing Values:** `deception_level` is missing 48 values. All other fields are fully populated.
- **Unique Levels:** Matches the defined experimental protocol (4 Pressures, 4 Roles, 5 Personalities, 3 Difficulties).

## 4. Cell Coverage
The dataset is highly unbalanced across the $4 \times 4 \times 5 \times 3 = 240$ possible factorial cells:
- **Observed cells:** 131
- **Missing cells:** 109
- **Observations per observed cell:** Minimum 1, Maximum 5.
- **Median cell count (of observed cells):** 1

## 5. Primary Outcome
The primary outcome analyzed is `deception_gap` (continuous).
**Summary Statistics (Observed):**
- **Mean:** 7.42
- **Standard Deviation:** 9.60
- **Variance:** 92.16
- **Median:** 5.0
- **IQR:** 10.0 (from 0 to 10)
- **Minimum:** -8.0
- **Maximum:** 30.0

## 6. Preliminary Variance
The historical dataset provides the following variance estimates for `deception_gap`:
- **Overall SD:** 9.60
- **Within-Pressure SD:** 
  - LOW: 3.63
  - MEDIUM: 6.73
  - HIGH: 11.38
  - EXTREME: 10.97
- **Within-Cell SD (where calculable):** The mean of within-cell SDs is 2.08, and the median is 0.0.
*Explanation:* The variance is heavily tied to the `BehaviorStrategy` (e.g., HONEST produces a constant 0 gap, while EXAGGERATION adds uniform random offsets). Because many cells in this dataset have $n=1$, or deterministic strategies, the observed within-cell variance is artifactually low. The true population within-cell variance is likely heterogeneous, depending on whether the assigned personality probabilistically splits between multiple behavior strategies under a given pressure.

## 7. Preliminary Effect Sizes
**Pressure Effect on `deception_gap` (OBSERVED FROM HISTORICAL DATA):**
- **LOW:** mean = 2.71
- **MEDIUM:** mean = 4.19
- **HIGH:** mean = 12.35
- **EXTREME:** mean = 10.69

**Estimated Effect Size:** 
The difference between LOW and HIGH pressure is approximately 9.64 units. Given the pooled SD of ~8.4 to 9.6, the observed preliminary effect size (Cohen's $d$) is approximately $1.0$ to $1.1$.
*Classification:* This is considered a **large** effect based on standard conventions (Cohen, 1988), suggesting that the main effect of pressure is highly detectable even with modest sample sizes.

## 8. Candidate R Values
For a fully balanced 240-cell factorial design, different repetition counts ($R$) yield the following total observations:
- $R = 5 \rightarrow 1,200$ developer observations (5 per cell)
- $R = 10 \rightarrow 2,400$ developer observations (10 per cell)
- $R = 15 \rightarrow 3,600$ developer observations (15 per cell)
- $R = 20 \rightarrow 4,800$ developer observations (20 per cell)
- $R = 30 \rightarrow 7,200$ developer observations (30 per cell)
- $R = 50 \rightarrow 12,000$ developer observations (50 per cell)

*(Note: Assuming 1 simulator execution produces 4 developer observations, the number of required simulator runs is $(240 \times R) / 4$.)*

## 9. Power/Sensitivity Analysis
Since the true within-cell variance is heterogeneous and partially obscured by sparsity, we perform a sensitivity analysis assuming a standard ANOVA framework.

**Assumptions for Sensitivity Analysis:**
- Alpha = 0.05
- Goal Power = 80% (0.80)

**Sensitivity by Effect Size (ASSUMED FOR SENSITIVITY ANALYSIS):**
- **Large effects (Cohen's $f \approx 0.40$):** Detectable with $R=1$ to $2$ (N = 240 to 480).
- **Medium effects (Cohen's $f \approx 0.25$):** Detectable with $R=2$ to $3$ (N = 480 to 720).
- **Small effects (Cohen's $f \approx 0.10$):** Detectable main effects with $R \ge 5$ (N = 1200). 
- **Two-Way Interactions (e.g., Pressure $\times$ Personality; 20 groups):** To reliably detect a medium interaction effect ($f = 0.25$), a total $N \approx 400$ is sufficient. To detect a small interaction effect ($f = 0.15$), a total $N \approx 1,000$ to $1,200$ is required.

**Conclusion:** 
$R=5$ ($N=1,200$) provides $>95\%$ power to detect medium main effects and medium two-way interactions. $R=10$ ($N=2,400$) provides near $100\%$ power for medium effects and $>80\%$ power to detect small interaction effects.

## 10. Factorial-Design Implications
- **Main-effect estimation:** With $N \ge 1,200$ ($R \ge 5$), the marginal sample sizes for main effects are massive (e.g., 300 per Pressure group), ensuring extreme precision.
- **Interactions:** The primary scientific interest lies in two-way interactions like Pressure $\times$ Personality and Pressure $\times$ Difficulty. $R=10$ provides 40 observations per two-way interaction group, allowing robust within-group variance estimation and detection of small-to-medium interaction effects.
- **Sparsity:** Any $R < 5$ risks poor within-cell variance estimation for the full 240-cell model, particularly for cells where probabilistic behavior strategies cause heavy-tailed variance.

## 11. Computational Cost
Estimated based on the current architecture:
- $1$ simulator run generates $4$ developer observations.
- Each developer observation requires roughly 2-3 LLM calls.
- Thus, $1$ simulator run $\approx 8$ to $12$ LLM calls.

**For Candidate R=10:**
- **Developer observations:** 2,400
- **Simulator runs:** $(240 \times 10) / 4 = 600$
- **Total LLM calls:** $\approx 4,800$ to $7,200$
- Assuming ~5 seconds per LLM call, $R=10$ requires roughly 7-10 hours of execution time, which is highly feasible for a final overnight campaign.

## 12. Recommended R
**RECOMMENDED FOR FINAL EXPERIMENT: $R = 10$**

**Justification:**
1. **Statistical Power:** $R=10$ ($N=2,400$) guarantees robust detection of small-to-medium two-way interaction effects, which are central to the research question (e.g., how specific personalities react to extreme pressure).
2. **Variance Estimation:** $R=10$ provides enough samples per 4-way cell to capture the stochastic probabilistic branching of `BehaviorStrategy`, preventing artifactual 0-variance cells.
3. **Computational Feasibility:** 600 simulator runs can comfortably complete overnight without incurring excessive cost or risking catastrophic failure mid-run.

## 13. Remaining Uncertainty
- The actual variance might be larger due to LLM natural-language hallucination drift, though numerical metrics are mostly protected.
- If non-parametric analysis (like Aligned Rank Transform) is ultimately required due to severe normality violations, $R=10$ remains a safe and robust sample size.

## 14. Final Dataset Size
**Planned Architecture Estimate:**
- **Factorial Cells:** 240
- **Repetitions per cell ($R$):** 10
- **Total Developer-Level Observations:** 2,400
- **Required Simulator Executions:** 600

## 15. Researcher Decisions Required
- Approve the recommendation of $R = 10$ (or select a different value).
- Authorize the modification of `simulator.py` and `runner.py` to support explicit factorial iteration (required before launching the campaign).
