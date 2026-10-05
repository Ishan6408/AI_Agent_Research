import os
import glob
import json
import pandas as pd
import numpy as np
import statsmodels.api as sm
import statsmodels.formula.api as smf

out_dir = 'analysis/final_campaign/cluster_aware'
os.makedirs(out_dir, exist_ok=True)

# 1. Load Data
campaign_dir = 'results/factorial_campaign'
files = glob.glob(os.path.join(campaign_dir, '*.json'))
data = []
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data.append(json.load(fp))

df = pd.DataFrame(data)
df['deception_gap'] = pd.to_numeric(df['deception_gap'])
df['deception_detected'] = df['deception_detected'].astype(int)
df['pressure'] = pd.Categorical(df['pressure'], categories=['LOW', 'MEDIUM', 'HIGH', 'EXTREME'], ordered=True)
df['execution_id'] = df['seed']

# OLS with cluster-robust standard errors
formula = 'deception_gap ~ C(pressure) + C(personality) + C(task_difficulty) + C(developer_role) + C(pressure):C(personality) + C(pressure):C(task_difficulty) + C(pressure):C(developer_role)'
model = smf.ols(formula, data=df)
res_robust = model.fit(cov_type='cluster', cov_kwds={'groups': df['execution_id']})

# cluster_model_results.csv
with open(os.path.join(out_dir, 'cluster_model_results.csv'), 'w') as f:
    f.write(res_robust.summary().as_csv())

# cluster_pressure_statistics.csv
desc_pressure = df.groupby('pressure', observed=False)['deception_gap'].agg(['count', 'mean', 'median', 'std']).reset_index()
desc_pressure.to_csv(os.path.join(out_dir, 'cluster_pressure_statistics.csv'), index=False)

# cluster_interaction_pressure_personality.csv
int_press_pers = df.groupby(['pressure', 'personality'], observed=False)['deception_gap'].agg(['count', 'mean', 'std']).reset_index()
int_press_pers.to_csv(os.path.join(out_dir, 'cluster_interaction_pressure_personality.csv'), index=False)

# cluster_interaction_pressure_difficulty.csv
int_press_diff = df.groupby(['pressure', 'task_difficulty'], observed=False)['deception_gap'].agg(['count', 'mean', 'std']).reset_index()
int_press_diff.to_csv(os.path.join(out_dir, 'cluster_interaction_pressure_difficulty.csv'), index=False)

# cluster_interaction_pressure_role.csv
int_press_role = df.groupby(['pressure', 'developer_role'], observed=False)['deception_gap'].agg(['count', 'mean', 'std']).reset_index()
int_press_role.to_csv(os.path.join(out_dir, 'cluster_interaction_pressure_role.csv'), index=False)

# cluster_pairwise_pressure_comparisons.csv
simple_model = smf.ols('deception_gap ~ C(pressure)', data=df).fit(cov_type='cluster', cov_kwds={'groups': df['execution_id']})
comparisons = []
for p1, p2, param in [('MEDIUM', 'LOW', 'C(pressure)[T.MEDIUM]'), 
                      ('HIGH', 'LOW', 'C(pressure)[T.HIGH]'), 
                      ('EXTREME', 'LOW', 'C(pressure)[T.EXTREME]')]:
    test = simple_model.t_test(f"{param} = 0")
    comparisons.append({'contrast': f'{p1} vs {p2}', 'coef': test.effect[0], 'pvalue': test.pvalue, 'se': test.sd[0]})

for p1, p2, expr in [('HIGH', 'MEDIUM', 'C(pressure)[T.HIGH] = C(pressure)[T.MEDIUM]'),
                     ('EXTREME', 'MEDIUM', 'C(pressure)[T.EXTREME] = C(pressure)[T.MEDIUM]'),
                     ('EXTREME', 'HIGH', 'C(pressure)[T.EXTREME] = C(pressure)[T.HIGH]')]:
    test = simple_model.t_test(expr)
    comparisons.append({'contrast': f'{p1} vs {p2}', 'coef': test.effect[0], 'pvalue': test.pvalue, 'se': test.sd[0]})

pd.DataFrame(comparisons).to_csv(os.path.join(out_dir, 'cluster_pairwise_pressure_comparisons.csv'), index=False)

# cluster_detection_results.csv
logit_model = smf.logit('deception_detected ~ C(pressure)', data=df).fit(cov_type='cluster', cov_kwds={'groups': df['execution_id']}, disp=0)
with open(os.path.join(out_dir, 'cluster_detection_results.csv'), 'w') as f:
    f.write(logit_model.summary().as_csv())

print("CSV Analysis Done")
