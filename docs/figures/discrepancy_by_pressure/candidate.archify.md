# FIGURE 4.4: DISCREPANCY BY PRESSURE {#discrepancy-by-pressure}

Reporting discrepancy rises sharply under schedule pressure, escalating from **2.78% under LOW** to **11.59% under HIGH pressure**. It hits an empirical ceiling and plateaus at **11.50% under EXTREME pressure**.

- Under LOW pressure (24h deadline), discrepancy averages 2.78% (SE = 0.23%, n = 600) with a 0.0% median, reflecting transparent status reporting.
- Under MEDIUM pressure (12h deadline), discrepancy increases modestly to 4.96% (+2.18% vs LOW, p < 0.001) as agents absorb minor schedule compression.
- Under HIGH pressure (6h deadline), discrepancy spikes to 11.59% (+8.81% vs LOW, t = 16.79, p < 0.001), indicating substantial penalty avoidance.
- Under EXTREME pressure (2h deadline), discrepancy plateaus at 11.50% (diff = -0.09% vs HIGH, t = -0.14, p = 0.887), confirming behavioral saturation.

@answer scope="Factorial campaign · 2,400 observations · 600 clusters · N=600 per tier"
@meta locale=en quality_profile=showcase style=clean

## What is the mean reporting discrepancy across pressure levels? {#mean-discrepancy}

```mermaid title="Reporting Discrepancy by Pressure Level (% points, N = 2,400)"
xychart-beta
  x-axis ["LOW (24h)", "MEDIUM (12h)", "HIGH (6h)", "EXTREME (2h)"]
  y-axis "Discrepancy (% points)" 0 --> 16
  bar "Mean Discrepancy" [2.78, 4.96, 11.59, 11.50]
  line "Mean Trajectory" [2.78, 4.96, 11.59, 11.50]
```

## How do descriptive statistics compare across pressure tiers? {#descriptive-table}

| Pressure Level | Deadline | Observations (n) | Clusters | Mean (%) | Std Dev (%) | Cluster SE (%) | 95% Conf. Interval | Median (%) | IQR | Range |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LOW | 24h | 600 | 150 | 2.78% | 4.94% | 0.23% | [2.33%, 3.22%] | 0.0% | 0.0% - 7.0% | -10% to +10% |
| MEDIUM | 12h | 600 | 150 | 4.96% | 6.87% | 0.29% | [4.39%, 5.52%] | 6.0% | 0.0% - 9.0% | -10% to +30% |
| HIGH | 6h | 600 | 150 | 11.59% | 11.07% | 0.47% | [10.66%, 12.52%] | 9.0% | 0.0% - 22.0% | 0% to +30% |
| EXTREME | 2h | 600 | 150 | 11.50% | 10.74% | 0.46% | [10.59%, 12.40%] | 9.0% | 0.0% - 21.0% | 0% to +30% |

## What do pairwise contrasts reveal about pressure transitions? {#pairwise-contrasts}

| Contrast Pair | Contrast Type | Mean Difference | Cluster Std Error | t-statistic | Holm-Adjusted p | Effect Size (Cohen's d) | Scientific Finding |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MEDIUM vs LOW | Schedule compression | +2.18% {caution:Elevated} | 0.37% | 5.94 | < 0.001 | 0.36 (Small-Medium) | Modest initial discrepancy increase |
| HIGH vs LOW | Severe pressure onset | +8.81% {bad:Severe} | 0.52% | 16.79 | < 0.001 | 1.03 (Large) | Substantial deception gap expansion |
| EXTREME vs LOW | Extreme constraint | +8.72% {bad:Severe} | 0.51% | 17.00 | < 0.001 | 1.04 (Large) | Sustained high discrepancy state |
| HIGH vs MEDIUM | Secondary step | +6.63% {bad:Severe} | 0.55% | 11.99 | < 0.001 | 0.72 (Medium-Large) | Discrepancy more than doubles |
| EXTREME vs MEDIUM | Secondary step | +6.54% {bad:Severe} | 0.54% | 12.06 | < 0.001 | 0.73 (Medium-Large) | Comparable elevation to HIGH |
| EXTREME vs HIGH | Plateau / Saturation | -0.09% {good:Saturated} | 0.66% | -0.14 | 0.887 (NS) | -0.01 (Negligible) | Statistically flat ceiling effect |

## How was the metric defined and validated? {#methodology}

@callout id=metric-callout level=note title="Metric Definition and Reproducibility"
The discrepancy metric is defined in `models/experiment.py` and `analysis/statistics.py` as the signed difference between an agent's self-reported progress and actual progress in percentage points: `deception_gap = reported_progress - actual_progress`.
Positive values indicate over-reporting (deception/exaggeration), zero indicates veracity, and negative values indicate conservative under-reporting. Data comprises 2,400 balanced observations across 600 factorial executions (seed 42 to 641), with unseeded pilot files excluded by design. Standard errors and confidence intervals reflect cluster-robust standard errors (CRSE) grouped by execution seed.
