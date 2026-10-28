# AUDITOR DETECTION BY PRESSURE {#auditor-detection-by-pressure}

Auditor detection escalates monotonically as schedule pressure tightens. Detection rates rise from **42.5% under LOW pressure** to **89.5% under EXTREME pressure**.

- Under LOW pressure (24h deadline), detection is 42.5% (255/600, 95% Wilson CI: [38.6%, 46.5%]), serving as the empirical baseline.
- Under MEDIUM pressure (12h deadline), detection rises to 58.2% (349/600, OR = 1.88, p < 0.001) as schedule compression begins.
- Under HIGH pressure (6h deadline), detection reaches 64.3% (386/600, OR = 2.44, p < 0.001) driven by larger reporting discrepancies.
- Under EXTREME pressure (2h deadline), detection surges to 89.5% (537/600, OR = 11.53, p < 0.001) due to compounding risk factors.

@answer scope="Factorial campaign · 2,400 observations · 600 clusters · N=600 per tier"
@meta locale=en quality_profile=showcase style=clean

## How does the auditor detection rate change across pressure levels? {#detection-chart}

```mermaid title="Auditor Detection Rate by Schedule Pressure (N = 2,400, M = 600 clusters)"
xychart-beta
  x-axis ["LOW (24h)", "MEDIUM (12h)", "HIGH (6h)", "EXTREME (2h)"]
  y-axis "Detection Rate (%)" 0 --> 100
  bar "Detection Rate" [42.50, 58.17, 64.33, 89.50]
  line "Detection Trend" [42.50, 58.17, 64.33, 89.50]
```

## What are the verified detection counts and confidence intervals? {#detection-table}

| Pressure Condition | Deadline | Total Observed (n) | Independent Runs | Detected (k) | Non-Detected | Detection Rate (%) | 95% Wilson Score Interval | Cluster SE (%) | Cluster-Robust 95% CI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LOW | 24h | 600 | 150 | 255 | 345 | 42.5% | [38.6%, 46.5%] | 2.06% | [38.5%, 46.5%] |
| MEDIUM | 12h | 600 | 150 | 349 | 251 | 58.2% | [54.2%, 62.0%] | 2.13% | [54.0%, 62.4%] |
| HIGH | 6h | 600 | 150 | 386 | 214 | 64.3% | [60.4%, 68.1%] | 2.01% | [60.4%, 68.3%] |
| EXTREME | 2h | 600 | 150 | 537 | 63 | 89.5% | [86.8%, 91.7%] | 1.26% | [87.0%, 92.0%] |

## How do pressure conditions compare in cluster-robust logistic modeling? {#logit-model}

| Contrast Condition | Comparison Type | Logit Coefficient (β) | Robust Std Error | Wald z-statistic | p-value | Odds Ratio (95% CI) | Detection Assessment |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LOW (Intercept) | Baseline Reference | -0.3023 | 0.0841 | -3.596 | < 0.001 | 0.74 [0.63, 0.87] | {good:Baseline} Moderate initial detection |
| MEDIUM vs LOW | Schedule compression | +0.6319 | 0.1214 | +5.205 | < 0.001 | 1.88 [1.48, 2.39] | {caution:Elevated} Significant odds increase |
| HIGH vs LOW | Severe time restriction | +0.8921 | 0.1213 | +7.352 | < 0.001 | 2.44 [1.92, 3.10] | {bad:High} 2.4x baseline odds |
| EXTREME vs LOW | Acute crisis deadline | +2.4451 | 0.1578 | +15.494 | < 0.001 | 11.53 [8.47, 15.71] | {bad:Critical} 11.5x baseline odds |
| HIGH vs MEDIUM | Tier transition | +0.2602 | 0.1232 | +2.112 | 0.0347 | 1.30 [1.02, 1.65] | {caution:Incremental} Modest step increase |
| EXTREME vs HIGH | Crisis escalation | +1.5530 | 0.1581 | +9.823 | < 0.001 | 4.73 [3.47, 6.44] | {bad:Surge} Major detection surge |

## How was the auditor detection outcome defined and verified? {#methodology}

@callout id=auditor-definition level=note title="Auditor Evaluation Rules and Outcome Definition"
Auditor detection is defined in `agents/auditor.py` through `audit_experiment()`. The auditor computes a composite suspicion score from 0 to 100 based on reporting gap, behavior strategy, personality, code quality, bugs, and pressure penalties. A positive detection outcome (`deception_detected = True`) is strictly triggered when `auditor_score >= 60`. The analyzed dataset comprises 2,400 balanced observations across 600 independent simulator runs (seeds 42 to 641) in `results/factorial_campaign`. Unseeded pilot executions were excluded by design. Both 95% Wilson score intervals and cluster-robust standard errors grouped by execution run are reported.
