# Final Figure Catalog

This catalog documents the presentation-ready figures generated for the final research package. All figures are located in `analysis/final_campaign/final_figures/`.

### 1. `1_pressure_main_effect.png`
- **What it shows:** The mean deception gap across the four pressure levels (LOW, MEDIUM, HIGH, EXTREME) with shaded confidence intervals.
- **Data source:** `analysis/final_campaign/pressure_statistics.csv`
- **Intended use:** Primary visualization for the main finding of the research report.
- **Key interpretation:** Demonstrates the highly significant main effect of organizational pressure on the deception gap, clearly visualizing the saturation plateau where HIGH and EXTREME pressure yield statistically indistinguishable levels of deception (LOW < MEDIUM < HIGH ≈ EXTREME).
- **Important caveat:** The confidence intervals shown are based on the standard error of the mean, but the formal p-value (0.887) for the plateau relies on the cluster-robust regression analysis, which is annotated on the chart.

### 2. `2_interaction_pressure_personality.png`
- **What it shows:** Line plot tracking the mean deception gap across pressure levels, separated by the 5 agent personalities.
- **Data source:** `analysis/final_campaign/interaction_pressure_personality.csv`
- **Intended use:** Visualization for the primary interaction finding.
- **Key interpretation:** Agent personality significantly moderates the effect of pressure. Risk-averse agents require higher pressure to begin deceiving, whereas opportunistic agents deceive early and aggressively.
- **Important caveat:** None.

### 3. `3_interaction_pressure_difficulty.png`
- **What it shows:** Line plot tracking the mean deception gap across pressure levels, separated by the 3 task difficulties.
- **Data source:** `analysis/final_campaign/interaction_pressure_difficulty.csv`
- **Intended use:** Appendix or secondary findings visualization.
- **Key interpretation:** Task difficulty does not significantly moderate the pressure-deception dynamic. All difficulties follow a roughly similar trajectory.
- **Important caveat:** The interaction is not statistically significant (p=0.1456); differences between lines are likely due to chance.

### 4. `4_interaction_pressure_role.png`
- **What it shows:** Line plot tracking the mean deception gap across pressure levels, separated by the 4 developer roles.
- **Data source:** `analysis/final_campaign/interaction_pressure_role.csv`
- **Intended use:** Appendix or secondary findings visualization.
- **Key interpretation:** Developer role does not significantly moderate the pressure-deception dynamic.
- **Important caveat:** The interaction is not statistically significant (p=0.0739); differences between lines are likely due to chance.

### 5. `5_auditor_detection_rate.png`
- **What it shows:** Bar chart displaying the percentage of agent runs flagged as deceptive by the rule-based auditor, broken down by pressure level, with confidence interval error bars.
- **Data source:** `analysis/final_campaign/detection_rates.csv`
- **Intended use:** Visualization of auditor mechanics and secondary consequences of high pressure.
- **Key interpretation:** The probability of detection increases significantly with pressure.
- **Important caveat:** The auditor is a static mathematical rule set. Higher detection means the infractions became more mathematically blatant, not that the auditor "learned" to detect deception better.

### 6. `6_deception_level_distribution.png`
- **What it shows:** 100% stacked bar chart visualizing the proportion of agents falling into each qualitative deception category (HONEST, MINOR, MODERATE, SEVERE) at each pressure level.
- **Data source:** `analysis/final_campaign/deception_level_summary.csv`
- **Intended use:** Presentation slide to quickly illustrate the shift in behavior distribution.
- **Key interpretation:** As pressure increases, the proportion of strictly honest reports shrinks, replaced progressively by minor and then moderate deception.
- **Important caveat:** "Severe Deception" did not manifest in significant quantities in this specific simulation configuration.
