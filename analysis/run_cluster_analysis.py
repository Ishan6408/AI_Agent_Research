import os
import glob
import json
import pandas as pd
import numpy as np
import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.stats.multicomp import pairwise_tukeyhsd

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

pressure_order = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME']
df['pressure'] = pd.Categorical(df['pressure'], categories=pressure_order, ordered=True)

# Grouping ID is 'seed' for the 600 simulator executions.
df['execution_id'] = df['seed']

# Validation
n_obs = len(df)
n_execs = df['execution_id'].nunique()
obs_per_exec = df.groupby('execution_id').size().value_counts().to_dict()
pressure_per_exec = df.groupby('execution_id')['pressure'].nunique().value_counts().to_dict()
cells = df.groupby(['pressure', 'developer_role', 'personality', 'task_difficulty'], observed=True).size()
cell_counts_dist = cells.value_counts().to_dict()

with open(os.path.join(out_dir, 'grouping_validation.txt'), 'w') as f:
    f.write(f"Observations: {n_obs}\n")
    f.write(f"Executions: {n_execs}\n")
    f.write(f"Observations per execution: {obs_per_exec}\n")
    f.write(f"Pressure levels per execution: {pressure_per_exec}\n")
    f.write(f"Cell count distribution: {cell_counts_dist}\n")

print("Validation Done")

# OLS with cluster-robust standard errors
formula = 'deception_gap ~ C(pressure) + C(personality) + C(task_difficulty) + C(developer_role) + C(pressure):C(personality) + C(pressure):C(task_difficulty) + C(pressure):C(developer_role)'
model = smf.ols(formula, data=df)
res_robust = model.fit(cov_type='cluster', cov_kwds={'groups': df['execution_id']})

with open(os.path.join(out_dir, 'cluster_model_results.txt'), 'w') as f:
    f.write(res_robust.summary().as_text())

# Also do a joint test for main effects and interactions using the robust covariance matrix
def write_wald_tests(res, formula):
    with open(os.path.join(out_dir, 'cluster_wald_tests.txt'), 'w') as f:
        for term in ['C(pressure)', 'C(personality)', 'C(task_difficulty)', 'C(developer_role)',
                     'C(pressure):C(personality)', 'C(pressure):C(task_difficulty)', 'C(pressure):C(developer_role)']:
            try:
                wald = res.wald_test_terms()
                f.write(f"{wald.summary_frame()}\n")
                break
            except Exception as e:
                f.write(f"Error for {term}: {e}\n")

write_wald_tests(res_robust, formula)

# Mixed effects model
try:
    md = smf.mixedlm("deception_gap ~ C(pressure) + C(personality) + C(task_difficulty) + C(developer_role) + C(pressure):C(personality) + C(pressure):C(task_difficulty) + C(pressure):C(developer_role)", df, groups=df["execution_id"])
    mdf = md.fit(method='cg')
    with open(os.path.join(out_dir, 'mixed_model_results.txt'), 'w') as f:
        f.write(mdf.summary().as_text())
except Exception as e:
    with open(os.path.join(out_dir, 'mixed_model_results.txt'), 'w') as f:
        f.write(f"Mixed model failed: {e}\n")

# Multiple comparisons (HIGH vs EXTREME)
simple_model = smf.ols('deception_gap ~ C(pressure)', data=df).fit(cov_type='cluster', cov_kwds={'groups': df['execution_id']})
with open(os.path.join(out_dir, 'cluster_pairwise_pressure_comparisons.txt'), 'w') as f:
    f.write(simple_model.summary().as_text())
    f.write("\n\nPairwise Tests:")
    f.write(f"\nMEDIUM vs LOW:\n{simple_model.t_test('C(pressure)[T.MEDIUM] = 0')}")
    f.write(f"\nHIGH vs LOW:\n{simple_model.t_test('C(pressure)[T.HIGH] = 0')}")
    f.write(f"\nEXTREME vs LOW:\n{simple_model.t_test('C(pressure)[T.EXTREME] = 0')}")
    f.write(f"\nHIGH vs MEDIUM:\n{simple_model.t_test('C(pressure)[T.HIGH] = C(pressure)[T.MEDIUM]')}")
    f.write(f"\nEXTREME vs MEDIUM:\n{simple_model.t_test('C(pressure)[T.EXTREME] = C(pressure)[T.MEDIUM]')}")
    f.write(f"\nEXTREME vs HIGH:\n{simple_model.t_test('C(pressure)[T.EXTREME] = C(pressure)[T.HIGH]')}")

# Auditor detection logistic regression
logit_model = smf.logit('deception_detected ~ C(pressure)', data=df).fit(cov_type='cluster', cov_kwds={'groups': df['execution_id']}, disp=0)
with open(os.path.join(out_dir, 'cluster_detection_results.txt'), 'w') as f:
    f.write(logit_model.summary().as_text())

print("Analysis Done")
