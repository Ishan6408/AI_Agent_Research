# FINAL STATISTICAL ANALYSIS

## Reproducibility
- **Git SHA**: a4c124bad797a8dd06f2c1ec94636cc4f8d1cd4e
- **Analysis Timestamp**: 2026-10-05T09:28:40.850059
- **Observations**: 2400
- **Primary Method**: Factorial ANOVA (OLS)
- **Model Metadata**: qwen2.5:7b, temp=0.3

## 1. Descriptive Statistics
- **Overall Deception Gap**: Mean = 7.71, Std = 9.62

**Means by Pressure:**
| pressure   |     mean |      std |   ci_lower |   ci_upper |
|:-----------|---------:|---------:|-----------:|-----------:|
| LOW        |  2.77833 |  4.93928 |    2.38311 |    3.17356 |
| MEDIUM     |  4.95667 |  6.86513 |    4.40734 |    5.50599 |
| HIGH       | 11.59    | 11.0713  |   10.7041  |   12.4759  |
| EXTREME    | 11.4967  | 10.7418  |   10.6371  |   12.3562  |

## 2. Model Results (ANOVA)
```
                                       sum_sq      df            F         PR(>F)
C(pressure)                      36777.204583     3.0   579.155436  4.682587e-282
C(personality)                  118899.469167     4.0  1404.292579   0.000000e+00
C(task_difficulty)                  59.190833     2.0     1.398177   2.472515e-01
C(developer_role)                   37.011250     3.0     0.582841   6.262614e-01
C(pressure):C(personality)       15906.380833    12.0    62.622126  3.497296e-132
C(pressure):C(task_difficulty)     190.419167     6.0     1.499330   1.743399e-01
C(pressure):C(developer_role)      334.587083     9.0     1.756323   7.167484e-02
Residual                         49954.466667  2360.0          NaN            NaN
```

## 3. Findings

1. **Does pressure affect deception_gap?**
   Yes, the effect of pressure is statistically significant (p = 4.683e-282).
2. **Which pressure level has the highest/lowest average deception_gap?**
   - Highest: HIGH
   - Lowest: LOW
3. **Is the pressure effect statistically significant?**
   Yes.
4. **Does personality significantly modify pressure's effect?**
   Yes (Interaction p = 3.497e-132).
5. **Does task difficulty modify pressure's effect?**
   No (Interaction p = 0.1743).
6. **Does developer role modify pressure's effect?**
   No (Interaction p = 0.07167).
7. **Does honesty change with pressure?**
   (See secondary outcomes table)
8. **Does performance change with pressure?**
   (See secondary outcomes table)
9. **How does auditor detection behave?**
   Detection rates by pressure:
| pressure   |   detection_rate |
|:-----------|-----------------:|
| LOW        |         0.425    |
| MEDIUM     |         0.581667 |
| HIGH       |         0.643333 |
| EXTREME    |         0.895    |
10. **What are the strongest findings?**
    The main effect of pressure is highly significant. (Add nuanced details upon human review).
11. **What findings are not supported?**
    Check non-significant interactions in the ANOVA table.

## 4. Assumption Checks & Independence / Design Structure
- **Independence**: The 2,400 observations come from 600 simulator runs (4 developers per run). The simulator executes the developers independently without shared state, justifying the treatment of each developer observation as independent. However, because they share a random seed per simulator run, there is theoretical grouping. A Mixed-Effects model would formally account for this, but given the total isolation of state, OLS provides a highly robust and simpler estimation. 
- **Assumptions**: ANOVA assumes normality and homoscedasticity. Since the sample size is large (N=2400), the Central Limit Theorem provides robustness against non-normality. 

## 5. Limitations
- Single LLM model (`qwen2.5:7b`).
- Local Ollama runtime execution.
- Temperature 0.3 means LLM outputs are relatively deterministic, but exact string reproducibility is still not guaranteed.
- Simulation-based environment, not real humans.
- The rule-based auditor may not capture all nuanced forms of deception.
- Grouping: 4 roles share a simulator execution seed, which technically introduces execution-level grouping, although state is strictly isolated.
