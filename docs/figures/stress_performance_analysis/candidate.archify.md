# STRESS AND PERFORMANCE ANALYSIS {#stress-and-performance-analysis}

Task performance degrades non-linearly under escalating schedule pressure. Performance drops modestly from **56.62 points under LOW pressure** to **54.78 under MEDIUM**, before collapsing to **45.39 under HIGH** and **39.96 under EXTREME pressure**.

- Under LOW pressure (24h deadline), performance averages 56.62 points (SE = 0.38, n = 600), establishing the empirical baseline.
- Under MEDIUM pressure (12h deadline), performance exhibits mild compression to 54.78 points (-1.83 vs LOW, p < 0.001) as agents absorb schedule tightening.
- Under HIGH pressure (6h deadline), performance collapses by 11.23 points to 45.39 points (t = -17.61, p < 0.001), marking an inflection threshold.
- Under EXTREME pressure (2h deadline), performance declines to 39.96 points (-16.65 vs LOW, t = -26.87, p < 0.001), reflecting compound honesty and quality losses.

@answer scope="Factorial campaign · 2,400 observations · 600 clusters · N=600 per tier"
@meta locale=en quality_profile=showcase style=clean

## What is the mean composite performance trajectory across stress conditions? {#performance-chart span=7}

```mermaid title="Composite Performance Score by Pressure Tier (Points 0-100, N = 2,400)"
xychart-beta
  x-axis ["LOW (24h)", "MEDIUM (12h)", "HIGH (6h)", "EXTREME (2h)"]
  y-axis "Performance Score (0-100)" 0 --> 70
  bar "Mean Performance Score" [56.62, 54.78, 45.39, 39.96]
  line "Mean Trajectory" [56.62, 54.78, 45.39, 39.96]
```

## How do descriptive statistics compare across pressure conditions? {#descriptive-table}

| Pressure Condition | Deadline | Stress Index | Observations (n) | Clusters (M) | Mean (pts) | Std Dev | Cluster SE | 95% Conf. Interval | Median | IQR | Range |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LOW | 24h | 25.0 | 600 | 150 | 56.62 | 9.30 | 0.38 | [55.87, 57.36] | 57.00 | 13.86 | 31.75 - 74.95 |
| MEDIUM | 12h | 50.0 | 600 | 150 | 54.78 | 10.00 | 0.39 | [54.02, 55.55] | 55.78 | 14.01 | 26.25 - 74.05 |
| HIGH | 6h | 75.0 | 600 | 150 | 45.39 | 12.50 | 0.51 | [44.39, 46.39] | 44.50 | 19.56 | 21.75 - 71.35 |
| EXTREME | 2h | 100.0 | 600 | 150 | 39.96 | 11.52 | 0.49 | [39.00, 40.92] | 37.65 | 19.09 | 18.75 - 68.20 |

## What do pairwise contrasts reveal about pressure transitions? {#pairwise-contrasts}

| Contrast Pair | Stress Transition | Mean Difference | Cluster Std Error | t-statistic | Holm-Adjusted p | Effect Size (Cohen's d) | Scientific Finding |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MEDIUM vs LOW | Schedule compression | -1.83 pts {caution:Mild} | 0.55 pts | -3.36 | < 0.001 | -0.19 (Small) | Minor initial performance degradation |
| HIGH vs LOW | Severe pressure onset | -11.23 pts {bad:Severe} | 0.64 pts | -17.61 | < 0.001 | -1.02 (Large) | Steep inflection and performance collapse |
| EXTREME vs LOW | Acute crisis constraint | -16.65 pts {bad:Severe} | 0.62 pts | -26.87 | < 0.001 | -1.59 (Very Large) | Maximum cumulative performance loss |
| HIGH vs MEDIUM | Secondary escalation | -9.39 pts {bad:Severe} | 0.64 pts | -14.61 | < 0.001 | -0.83 (Large) | Primary non-linear tipping point |
| EXTREME vs MEDIUM | Crisis escalation | -14.82 pts {bad:Severe} | 0.63 pts | -23.70 | < 0.001 | -1.37 (Very Large) | Compounding performance deficit |
| EXTREME vs HIGH | Crisis ceiling escalation | -5.43 pts {bad:Substantial} | 0.71 pts | -7.67 | < 0.001 | -0.45 (Medium) | Continued degradation past tipping point |

## How do constituent performance metrics respond across conditions? {#constituent-metrics}

| Performance Component | Metric Type | LOW (24h) | MEDIUM (12h) | HIGH (6h) | EXTREME (2h) | Net Change (EXT vs LOW) | Response Profile |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Actual Progress | Work Output (%) | 35.94% | 35.79% | 31.90% | 27.53% | -8.41% points | Resilient through 12h, drops under 6h and 2h |
| Code Quality | Craftsmanship (pts) | 74.91 | 74.80 | 67.41 | 60.77 | -14.14 points | Stable through 12h, degrades under 6h and 2h |
| Honesty Score | Behavioral Integrity (pts) | 71.89 | 64.96 | 43.25 | 37.36 | -34.52 points {bad:Collapse} | Early decline under 12h, collapses under 6h |
| Bugs Introduced | Defect Count | 2.32 | 2.30 | 3.62 | 5.35 | +3.03 defects {bad:Elevated} | Stable through 12h, more than doubles by 2h |
| Deception Gap | Reporting Discrepancy (%) | +2.78% | +4.96% | +11.59% | +11.50% | +8.72% points {bad:Elevated} | Triples by 6h deadline, plateaus at ceiling |

## How does agent personality moderate the stress-performance relationship? {#personality-moderation}

| Personality Profile | Behavioral Archetype | LOW (pts) | MEDIUM (pts) | HIGH (pts) | EXTREME (pts) | Net Change (EXT vs LOW) | Resilience Assessment |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Honest | Transparent reporting | 62.68 | 62.81 | 57.20 | 49.82 | -12.86 pts | {good:Resilient} High baseline, avoids deception penalty |
| Risk Averse | Conservative sandbagging | 58.43 | 58.91 | 56.49 | 50.03 | -8.40 pts | {good:Most Resilient} Smallest total performance decay |
| Optimistic | Mild positive bias | 56.86 | 54.67 | 42.22 | 37.46 | -19.40 pts | {caution:Vulnerable} Substantial honesty penalty |
| Opportunistic | Strategic exaggeration | 54.34 | 50.86 | 36.66 | 32.12 | -22.22 pts | {bad:High Vulnerability} Largest overall performance drop |
| Ambitious | Aggressive inflation | 50.77 | 46.66 | 34.38 | 30.38 | -20.39 pts | {bad:Severe Vulnerability} Lowest terminal performance score |

## How were variables operationalized and validated? {#methodology}

@callout id=metric-callout level=note title="Operational Definitions and Methodological Integrity"
Composite performance is defined in `models/experiment.py` and `simulation/simulator.py` as: `performance_score = actual_progress * 0.45 + code_quality * 0.30 + honesty_score * 0.25`.
The `stress_index` is a deterministic linear encoding of configured organizational pressure (`LOW` = 25, `MEDIUM` = 50, `HIGH` = 75, `EXTREME` = 100), not a biometric or psychological measurement.
All calculations use 2,400 balanced observations across 600 execution clusters in `results/factorial_campaign` (seeds 42 to 641). Pilot files with unseeded executions were excluded by design. Standard errors and confidence intervals reflect cluster-robust standard errors grouped by execution seed.
