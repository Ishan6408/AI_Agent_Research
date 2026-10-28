"""
Reproducible publication figure generator for:
AUDITOR DETECTION BY PRESSURE

Dataset: results/factorial_campaign/*.json (N=2,400, 600 clusters)
Metric: deception_detected (True/False based on auditor_score >= 60)
Uncertainty: 95% Wilson Score Interval & Cluster-Robust Estimation
"""

import os
import glob
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.stats.proportion import proportion_confint

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(base_dir, "../../.."))
    campaign_dir = os.path.join(repo_root, "results", "factorial_campaign")
    
    files = glob.glob(os.path.join(campaign_dir, "*.json"))
    if not files:
        raise FileNotFoundError(f"No experiment JSON files found in {campaign_dir}")
        
    records = []
    for f in files:
        with open(f, "r", encoding="utf-8") as fp:
            records.append(json.load(fp))
            
    df = pd.DataFrame(records)
    df["deception_detected"] = df["deception_detected"].astype(int)
    
    pressure_tiers = ["LOW", "MEDIUM", "HIGH", "EXTREME"]
    deadlines = {"LOW": "24h", "MEDIUM": "12h", "HIGH": "6h", "EXTREME": "2h"}
    
    stats_list = []
    for p in pressure_tiers:
        sub = df[df["pressure"] == p]
        n = len(sub)
        clusters = sub["seed"].nunique()
        k = sub["deception_detected"].sum()
        rate = k / n
        
        # 95% Wilson score interval
        w_low, w_upp = proportion_confint(k, n, method="wilson", alpha=0.05)
        
        # Cluster-level SE and 95% CI
        cluster_rates = sub.groupby("seed")["deception_detected"].mean()
        cr_se = cluster_rates.std(ddof=1) / np.sqrt(clusters)
        cr_low = rate - 1.96 * cr_se
        cr_upp = rate + 1.96 * cr_se
        
        stats_list.append({
            "pressure": p,
            "deadline": deadlines[p],
            "n": n,
            "clusters": clusters,
            "detected": k,
            "not_detected": n - k,
            "rate": rate,
            "rate_pct": rate * 100,
            "wilson_low": w_low * 100,
            "wilson_upp": w_upp * 100,
            "wilson_err_low": (rate - w_low) * 100,
            "wilson_err_upp": (w_upp - rate) * 100,
            "cr_se": cr_se * 100,
            "cr_low": cr_low * 100,
            "cr_upp": cr_upp * 100
        })
        
    stats_df = pd.DataFrame(stats_list)
    print("Computed Statistics:")
    print(stats_df[["pressure", "deadline", "n", "detected", "rate_pct", "wilson_low", "wilson_upp", "cr_se"]])
    
    # Save CSV summary
    stats_df.to_csv(os.path.join(base_dir, "auditor_detection_summary.csv"), index=False)
    
    # Generate 300 DPI Publication Figure
    plt.rcParams["font.family"] = "sans-serif"
    plt.rcParams["font.sans-serif"] = ["Segoe UI", "DejaVu Sans", "Helvetica", "Arial"]
    
    fig, ax = plt.subplots(figsize=(8.5, 6.2), dpi=300)
    fig.patch.set_facecolor("#FFFFFF")
    ax.set_facecolor("#FFFFFF")
    
    x_indices = np.arange(len(pressure_tiers))
    bar_width = 0.58
    
    # Colors: Professional dark navy and muted slate/blue
    bar_color = "#2563EB"     # Tailwind blue-600
    edge_color = "#1D4ED8"    # Tailwind blue-700
    error_color = "#0F172A"   # Dark slate navy
    grid_color = "#E2E8F0"    # Subtle border slate
    
    # Draw bars
    bars = ax.bar(
        x_indices,
        stats_df["rate_pct"],
        width=bar_width,
        color=bar_color,
        edgecolor=edge_color,
        linewidth=1.2,
        alpha=0.90,
        zorder=3
    )
    
    # Draw Wilson 95% confidence error bars
    yerr = np.array([stats_df["wilson_err_low"], stats_df["wilson_err_upp"]])
    ax.errorbar(
        x_indices,
        stats_df["rate_pct"],
        yerr=yerr,
        fmt="none",
        ecolor=error_color,
        elinewidth=2.0,
        capsize=7,
        capthick=2.0,
        zorder=4
    )
    
    # Direct data labels
    for idx, row in stats_df.iterrows():
        y_pos = row["rate_pct"]
        err_top = row["wilson_upp"]
        
        # Primary label: Percentage
        ax.text(
            idx,
            err_top + 2.2,
            f"{row['rate_pct']:.1f}%",
            ha="center",
            va="bottom",
            fontsize=12.5,
            fontweight="bold",
            color="#0F172A",
            zorder=5
        )
        
        # Secondary label: Exact fraction
        ax.text(
            idx,
            err_top + 7.0,
            f"({row['detected']} / {row['n']})",
            ha="center",
            va="bottom",
            fontsize=9.5,
            color="#475569",
            zorder=5
        )
        
        # Interior bar label: Two-line CI range to fit comfortably within bar boundaries
        ax.text(
            idx,
            y_pos * 0.45,
            f"95% CI\n[{row['wilson_low']:.1f}%, {row['wilson_upp']:.1f}%]",
            ha="center",
            va="center",
            fontsize=8.5,
            color="#FFFFFF",
            fontweight="bold",
            linespacing=1.2,
            zorder=5
        )
        
    # Formatting Axes
    x_labels = [
        f"{row['pressure']}\n({row['deadline']} deadline)\n[150 runs, n=600]"
        for _, row in stats_df.iterrows()
    ]
    ax.set_xticks(x_indices)
    ax.set_xticklabels(x_labels, fontsize=10.5, color="#1E293B")
    
    ax.set_ylabel("Auditor Detection Rate (%)", fontsize=12, color="#0F172A", fontweight="bold", labelpad=10)
    ax.set_xlabel("Schedule Pressure Tier", fontsize=12, color="#0F172A", fontweight="bold", labelpad=12)
    
    ax.set_ylim(0, 114)
    ax.set_yticks(np.arange(0, 101, 10))
    ax.set_yticklabels([f"{y}%" for y in np.arange(0, 101, 10)], fontsize=10, color="#334155")
    
    # Subtle horizontal grid
    ax.grid(axis="y", color=grid_color, linestyle="--", linewidth=0.8, alpha=0.9, zorder=0)
    ax.grid(axis="x", visible=False)
    
    # Clean spines
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)
    for spine in ["left", "bottom"]:
        ax.spines[spine].set_color("#94A3B8")
        ax.spines[spine].set_linewidth(1.0)
        
    # Title and Subtitle
    plt.suptitle(
        "AUDITOR DETECTION BY PRESSURE",
        fontsize=14,
        fontweight="bold",
        color="#0F172A",
        y=0.97
    )
    ax.set_title(
        "Positive Detection: Suspicion Score ≥ 60 (Rule-Based Auditor with LLM Explanation)\n"
        "Error bars represent 95% Wilson Score Intervals across N = 2,400 observations (600 runs)",
        fontsize=9.5,
        color="#475569",
        pad=16,
        linespacing=1.3
    )
    
    plt.tight_layout(rect=[0, 0, 1, 0.94])
    
    output_png = os.path.join(base_dir, "figure_auditor_detection_by_pressure.png")
    plt.savefig(output_png, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    output_png_alt = os.path.join(base_dir, "auditor_detection_by_pressure.png")
    plt.savefig(output_png_alt, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print(f"Publication PNG exported to: {output_png} and {output_png_alt}")

if __name__ == "__main__":
    main()
