import glob
import json
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

def main():
    # 1. Load the 2,400 raw JSON records
    files = sorted(glob.glob('results/factorial_campaign/*.json'))
    records = []
    for f in files:
        with open(f, 'r', encoding='utf-8') as fp:
            d = json.load(fp)
            records.append({
                'experiment_id': d['experiment_id'],
                'pressure': d['pressure'],
                'seed': d['seed'],
                'developer_role': d['developer_role'],
                'personality': d['personality'],
                'deception_gap': d['deception_gap']
            })
    df = pd.DataFrame(records)

    pressure_levels = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME']
    df['pressure'] = pd.Categorical(df['pressure'], categories=pressure_levels, ordered=True)

    # 2. Compute group summary statistics
    summary = []
    for p in pressure_levels:
        sub = df[df['pressure'] == p]['deception_gap']
        n = len(sub)
        mean = sub.mean()
        std = sub.std()
        # Clustered SE by seed (150 clusters per pressure)
        run_means = df[df['pressure'] == p].groupby('seed')['deception_gap'].mean()
        crse = run_means.std() / np.sqrt(len(run_means))
        ci95 = 1.96 * crse
        summary.append({
            'pressure': p,
            'n': n,
            'clusters': len(run_means),
            'mean': mean,
            'std': std,
            'crse': crse,
            'ci_low': mean - ci95,
            'ci_high': mean + ci95,
            'median': sub.median()
        })
    summary_df = pd.DataFrame(summary)

    # 3. Create high-resolution publication plot
    fig, ax = plt.subplots(figsize=(9, 6), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')

    # Add subtle jittered observations
    np.random.seed(42)
    x_pos = np.arange(len(pressure_levels))
    for i, p in enumerate(pressure_levels):
        vals = df[df['pressure'] == p]['deception_gap'].values
        jitter = np.random.normal(0, 0.07, size=len(vals))
        ax.scatter(i + jitter, vals, color='#94A3B8', alpha=0.15, s=14, edgecolors='none', zorder=2)

    # Plot point and error bar
    means = summary_df['mean'].values
    ci_err = (summary_df['ci_high'] - summary_df['mean']).values

    # Draw dashed connecting line between means to illustrate trajectory across categorical levels
    ax.plot(x_pos, means, color='#0284C7', linestyle='--', linewidth=1.5, alpha=0.7, zorder=3, label='Mean Trajectory')

    # Error bars (95% CI based on Cluster-Robust Standard Errors)
    ax.errorbar(
        x_pos, means, yerr=ci_err,
        fmt='o', color='#0F172A', ecolor='#0284C7', elinewidth=2.2,
        capsize=6, capthick=2.0, markersize=8, markerfacecolor='#0284C7', markeredgecolor='#0F172A',
        markeredgewidth=1.5, zorder=4, label='Mean Discrepancy (95% CI, CRSE)'
    )

    # Annotate values and sample sizes
    for i, row in summary_df.iterrows():
        label_text = f"{row['mean']:.2f}%\n(n = {int(row['n'])})"
        ax.annotate(
            label_text,
            (i, row['mean']),
            textcoords="offset points",
            xytext=(0, 16),
            ha='center',
            fontsize=10,
            fontweight='600',
            color='#0F172A',
            bbox=dict(boxstyle='round,pad=0.25', facecolor='#F8FAFC', edgecolor='#CBD5E1', alpha=0.95)
        )

    # Formatting axes
    ax.set_xticks(x_pos)
    ax.set_xticklabels(['LOW\n(24h deadline)', 'MEDIUM\n(12h deadline)', 'HIGH\n(6h deadline)', 'EXTREME\n(2h deadline)'], fontsize=11, fontweight='500', color='#0F172A')
    ax.set_xlabel('Organizational Pressure Tier', fontsize=12, fontweight='600', color='#0F172A', labelpad=10)
    ax.set_ylabel('Reporting Discrepancy (Reported - Actual, % points)', fontsize=12, fontweight='600', color='#0F172A', labelpad=10)
    ax.set_title('FIGURE 4.4: DISCREPANCY BY PRESSURE\nMean Discrepancy with 95% Cluster-Robust Confidence Intervals (N = 2,400)', fontsize=13, fontweight='700', color='#0F172A', pad=18)

    ax.set_ylim(-12, 36)
    ax.axhline(0, color='#64748B', linestyle=':', linewidth=1.0, alpha=0.8)

    # Styling grid and spines
    ax.grid(axis='y', linestyle='-', linewidth=0.6, color='#E2E8F0', alpha=0.8)
    ax.grid(axis='x', visible=False)
    for spine in ax.spines.values():
        spine.set_color('#CBD5E1')
        spine.set_linewidth(1.0)

    ax.legend(frameon=True, facecolor='#F8FAFC', edgecolor='#CBD5E1', loc='upper left', fontsize=10)

    plt.tight_layout()
    output_png = 'docs/figures/discrepancy_by_pressure/figure_4_4_discrepancy_by_pressure.png'
    plt.savefig(output_png, dpi=300, bbox_inches='tight')
    print('Successfully saved PNG to:', output_png)

if __name__ == '__main__':
    main()
