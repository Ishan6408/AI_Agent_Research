# Final Table Catalog

This catalog maps existing analysis CSV files to the final tables intended for the academic research report. The CSV files are located in `analysis/final_campaign/`.

### Table 1: Main Effect of Pressure on Deception Gap
- **Source File:** `pressure_statistics.csv`
- **Recommended Report Table Name:** Table 1 - Descriptive Statistics of Deception Gap by Pressure Level
- **Columns to include:** Pressure, N (Count), Mean, Median, Std Dev, 95% CI Lower, 95% CI Upper
- **Usage:** Provide baseline descriptive statistics before introducing the cluster-aware inferential model.

### Table 2: Pairwise Pressure Contrasts (The Plateau)
- **Source File:** `pairwise_pressure_comparisons.csv`
- **Recommended Report Table Name:** Table 2 - Pairwise Comparisons of Deception Gap
- **Columns to include:** Group 1, Group 2, Mean Difference, p-adj (Tukey/Bonferroni)
- **Usage:** Specifically used to formally document that the HIGH vs. EXTREME difference is not statistically significant (p=0.887). *(Note: The CSV contains the Tukey HSD p-values; the text should note that the cluster-robust Bonferroni contrast also yielded p=0.887 as verified in Phase 5A.15).*

### Table 3: Interaction of Pressure and Personality
- **Source File:** `interaction_pressure_personality.csv`
- **Recommended Report Table Name:** Table 3 - Mean Deception Gap by Personality and Pressure
- **Columns to include:** Pressure, Personality, Mean, Std Dev
- **Usage:** Tabular support for the significant moderation effect of personality.

### Table 4: Auditor Detection Rates
- **Source File:** `detection_rates.csv`
- **Recommended Report Table Name:** Table 4 - Auditor Detection Probability by Pressure
- **Columns to include:** Pressure, Detection Rate, 95% CI Lower, 95% CI Upper
- **Usage:** Document the increasing likelihood of triggering the static rule-based auditor.

### Tables Not Recommended for Primary Report Body
The following files describe interactions that were found to be statistically non-significant. They should be placed in an Appendix or omitted entirely to save space, simply stating the non-significance in the text:
- `interaction_pressure_difficulty.csv`
- `interaction_pressure_role.csv`
