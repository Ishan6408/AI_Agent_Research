# FIGURE 4.6: ROLE OR PROFILE COMPARISON

This directory contains the verified data, reproducible generation scripts, publication-quality image assets, and validated interactive Archify explainer artifacts for **Figure 4.6: Role or Profile Comparison** in the B.Tech research project VEIL (AI Agent Deception Research).

---

## 1. Metric Definitions and Mathematical Implementation

### Primary Metric: Deception Gap (`deception_gap`)
- **Source Code Definition**: [`models/experiment.py`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/models/experiment.py#L39) and [`analysis/statistics.py`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/analysis/statistics.py#L42).
- **Formula**:
  $$\text{deception\_gap} = \text{reported\_progress} - \text{actual\_progress}$$
- **Units & Scale**: Expressed in percentage points ($\%$), bounded within $[-10\%, +30\%]$ in the simulation.
- **Direction of Interpretation**:
  - **Positive ($>0\%$)**: Over-reporting / exaggeration (emergent deceptive reporting).
  - **Zero ($0\%$)**: Veridical reporting (honest fidelity).
  - **Negative ($<0\%$)**: Under-reporting / conservative sandbagging.

### Secondary Metric: Auditor Detection Rate (`deception_detected`)
- **Source Code Definition**: [`agents/auditor.py`](file:///c:/Users/igpat/Downloads/AI_Agent_Research/agents/auditor.py#L194).
- **Rule**: $\text{deception\_detected} = \text{True} \iff \text{auditor\_score} \ge 60$.
- **Calculation**: $\frac{\text{detected}}{\text{eligible evaluated observations}} \times 100\%$.

---

## 2. Roles vs. Profiles Distinction in Project VEIL

In the VEIL experimental design, two distinct classification axes are evaluated:
1. **Agent Personality Profiles** (`personality`): 5 distinct behavioral archetypes injected into the agent prompt and behavioral strategy selection (`HONEST`, `RISK_AVERSE`, `OPTIMISTIC`, `OPPORTUNISTIC`, `AMBITIOUS`).
   - Represents the internal behavioral disposition / persona of the agent.
   - **Sample Size**: $n = 480$ observations per profile ($5 \times 480 = 2,400$ total).
   - **Empirical Effect**: Massive, statistically significant behavioral divergence ($\chi^2 = 2,450.87, p < 0.0001$).
2. **Technical Developer Roles** (`developer_role`): 4 organizational task specializations (`Frontend Developer`, `Backend Developer`, `DevOps Engineer`, `QA Engineer`).
   - Represents the functional domain assigned to the agent.
   - **Sample Size**: $n = 600$ observations per role ($4 \times 600 = 2,400$ total).
   - **Empirical Effect**: Statistically indistinguishable performance ($\chi^2 = 2.11, p = 0.5492$). All roles inherit from the identical base agent strategy engine (`agents/backend.py`), resulting in near-identical deception gap means ($7.58\%$ to $7.91\%$).

---

## 3. Verified Statistical Summary

### A. Agent Personality Profiles ($n = 480$ each)

| Personality Profile | $n$ | Independent Clusters | Mean Gap ($\mu$) | Std Dev ($\sigma$) | $95\%$ Confidence Interval | Median Gap | Auditor Detections | Detection Rate ($\%$) | $95\%$ Wilson CI |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Risk Averse** | 480 | 120 | **$-1.58\%$** | $3.18\%$ | $[-1.87\%, -1.30\%]$ | $0.0\%$ | 153 | **$31.88\%$** | $[27.9\%, 36.2\%]$ |
| **Honest** | 480 | 120 | **$+0.27\%$** | $1.43\%$ | $[+0.14\%, +0.40\%]$ | $0.0\%$ | 90 | **$18.75\%$** | $[15.5\%, 22.5\%]$ |
| **Optimistic** | 480 | 120 | **$+11.08\%$** | $8.09\%$ | $[+10.36\%, +11.81\%]$ | $8.0\%$ | 394 | **$82.08\%$** | $[78.4\%, 85.3\%]$ |
| **Opportunistic** | 480 | 120 | **$+12.68\%$** | $8.43\%$ | $[+11.93\%, +13.44\%]$ | $9.0\%$ | 427 | **$88.96\%$** | $[85.8\%, 91.5\%]$ |
| **Ambitious** | 480 | 120 | **$+16.07\%$** | $8.19\%$ | $[+15.34\%, +16.81\%]$ | $17.0\%$ | 463 | **$96.46\%$** | $[94.4\%, 97.8\%]$ |

### B. Developer Roles ($n = 600$ each)

| Developer Role | $n$ | Independent Runs | Mean Gap ($\mu$) | Std Dev ($\sigma$) | $95\%$ Confidence Interval | Median Gap | Auditor Detections | Detection Rate ($\%$) | $95\%$ Wilson CI |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Frontend Developer** | 600 | 600 | **$7.58\%$** | $9.62\%$ | $[6.81\%, 8.35\%]$ | $6.0\%$ | 430 | **$71.67\%$** | $[67.9\%, 75.1\%]$ |
| **Backend Developer** | 600 | 600 | **$7.64\%$** | $9.44\%$ | $[6.88\%, 8.40\%]$ | $6.0\%$ | 403 | **$67.17\%$** | $[63.3\%, 70.8\%]$ |
| **DevOps Engineer** | 600 | 600 | **$7.69\%$** | $9.57\%$ | $[6.92\%, 8.46\%]$ | $6.0\%$ | 366 | **$61.00\%$** | $[57.0\%, 64.8\%]$ |
| **QA Engineer** | 600 | 600 | **$7.91\%$** | $9.88\%$ | $[7.12\%, 8.70\%]$ | $6.0\%$ | 328 | **$54.67\%$** | $[50.7\%, 58.6\%]$ |

---

## 4. Directory Contents and Output Filenames

- `figure_4_6_role_profile_comparison.png`: 300 DPI high-resolution dual-panel comparison plot suitable for report insertion.
- `role_profile_comparison.png`: Mirror of the 300 DPI publication plot.
- `figure_4_6_role_profile_comparison.html`: Interactive, responsive standalone HTML explainer validated through the Archify CLI.
- `figure_4_6_role_profile_comparison.json`: Editable Archify explainer specification.
- `candidate.archify.md`: Human-readable Archify markdown document source.
- `generate_figure.py`: Reproducible Python generation script.
- `role_profile_summary.csv`: Machine-readable summary data containing all means, standard errors, confidence intervals, and detection rates.
- `README.md`: This comprehensive documentation file.

---

## 5. Methodological Notes and Limitations

1. **Exclusions**: 39 unseeded pilot JSON files in `results/` (`seed=null`) and legacy unstratified rows were excluded by design per `results/statistical_analysis/dataset_validation.json`. All 2,400 records in `results/factorial_campaign` were valid and included.
2. **Clustering & Independence**: Observations are nested within $M = 600$ simulator executions (4 roles per seed). Because each role appears exactly once per run, role-level observations are independent across runs. For personality profiles, the balanced factorial design ensures equal distribution across runs.
3. **Observational Nature**: Differences in deception across personalities are induced by deterministic and probabilistic rule sets in `agents/backend.py` reflecting assigned behavioral personas, not human psychology.
