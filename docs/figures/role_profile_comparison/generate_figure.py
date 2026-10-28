"""
Reproducible publication figure generator for:
FIGURE 4.6: ROLE OR PROFILE COMPARISON

Dataset: results/factorial_campaign/*.json (N=2,400, 600 clusters)
Primary Metric: deception_gap = reported_progress - actual_progress (percentage points, %)
Secondary Metric: auditor_detection_rate (auditor_score >= 60)
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
    df["deception_gap"] = pd.to_numeric(df["deception_gap"])
    df["deception_detected"] = df["deception_detected"].astype(int)
    
    # Personality Profiles
    pers_order = ["RISK_AVERSE", "HONEST", "OPTIMISTIC", "OPPORTUNISTIC", "AMBITIOUS"]
    pers_labels = ["Risk Averse\n(n=480)", "Honest\n(n=480)", "Optimistic\n(n=480)", "Opportunistic\n(n=480)", "Ambitious\n(n=480)"]
    
    pers_stats = []
    for p in pers_order:
        sub = df[df["personality"] == p]
        n = len(sub)
        mean_val = sub["deception_gap"].mean()
        std_val = sub["deception_gap"].std()
        se_val = std_val / np.sqrt(n)
        ci_low = mean_val - 1.96 * se_val
        ci_upp = mean_val + 1.96 * se_val
        det_k = sub["deception_detected"].sum()
        det_rate = det_k / n
        w_low, w_upp = proportion_confint(det_k, n, method="wilson", alpha=0.05)
        pers_stats.append({
            "category_type": "Personality Profile",
            "name": p,
            "n": n,
            "mean_gap": mean_val,
            "std_gap": std_val,
            "se_gap": se_val,
            "ci_low": ci_low,
            "ci_upp": ci_upp,
            "detected_k": det_k,
            "detection_rate": det_rate * 100,
            "wilson_low": w_low * 100,
            "wilson_upp": w_upp * 100
        })
    df_pers = pd.DataFrame(pers_stats)
    
    # Developer Roles
    role_order = ["Frontend Developer", "Backend Developer", "DevOps Engineer", "QA Engineer"]
    role_labels = ["Frontend Dev\n(n=600)", "Backend Dev\n(n=600)", "DevOps Eng\n(n=600)", "QA Engineer\n(n=600)"]
    
    role_stats = []
    for r in role_order:
        sub = df[df["developer_role"] == r]
        n = len(sub)
        mean_val = sub["deception_gap"].mean()
        std_val = sub["deception_gap"].std()
        se_val = std_val / np.sqrt(n)
        ci_low = mean_val - 1.96 * se_val
        ci_upp = mean_val + 1.96 * se_val
        det_k = sub["deception_detected"].sum()
        det_rate = det_k / n
        w_low, w_upp = proportion_confint(det_k, n, method="wilson", alpha=0.05)
        role_stats.append({
            "category_type": "Developer Role",
            "name": r,
            "n": n,
            "mean_gap": mean_val,
            "std_gap": std_val,
            "se_gap": se_val,
            "ci_low": ci_low,
            "ci_upp": ci_upp,
            "detected_k": det_k,
            "detection_rate": det_rate * 100,
            "wilson_low": w_low * 100,
            "wilson_upp": w_upp * 100
        })
    df_roles = pd.DataFrame(role_stats)
    
    # Save combined summary
    combined_summary = pd.concat([df_pers, df_roles], ignore_index=True)
    combined_summary.to_csv(os.path.join(base_dir, "role_profile_summary.csv"), index=False)
    print("Combined Summary Data:")
    print(combined_summary[["category_type", "name", "n", "mean_gap", "ci_low", "ci_upp", "detection_rate"]])
    
    # Publication Figure (2 subplots side-by-side with shared Y-scale)
    plt.rcParams["font.family"] = "sans-serif"
    plt.rcParams["font.sans-serif"] = ["Segoe UI", "DejaVu Sans", "Helvetica", "Arial"]
    
    fig, (ax1, ax2) = plt.subplots(
        1, 2, 
        figsize=(11.5, 5.8), 
        dpi=300, 
        gridspec_kw={"width_ratios": [5, 4]}
    )
    fig.patch.set_facecolor("#FFFFFF")
    
    bar_color_pers = "#2563EB"   # Tailwind blue-600
    bar_color_role = "#0D9488"   # Tailwind teal-600
    edge_color_pers = "#1D4ED8"
    edge_color_role = "#0F766E"
    err_color = "#0F172A"
    grid_color = "#E2E8F0"
    
    # Common Y Limits
    y_min, y_max = -5, 21
    
    # --- SUBPLOT 1: Personality Profiles ---
    ax1.set_facecolor("#FFFFFF")
    x1 = np.arange(len(pers_order))
    bars1 = ax1.bar(
        x1, 
        df_pers["mean_gap"], 
        width=0.55, 
        color=bar_color_pers, 
        edgecolor=edge_color_pers, 
        linewidth=1.2, 
        alpha=0.90, 
        zorder=3
    )
    ax1.errorbar(
        x1, 
        df_pers["mean_gap"], 
        yerr=1.96 * df_pers["se_gap"], 
        fmt="none", 
        ecolor=err_color, 
        elinewidth=1.8, 
        capsize=6, 
        capthick=1.8, 
        zorder=4
    )
    ax1.axhline(0, color="#64748B", linewidth=1.2, linestyle="-", zorder=2)
    
    # Data labels for ax1
    for idx, row in df_pers.iterrows():
        y_val = row["mean_gap"]
        err = 1.96 * row["se_gap"]
        if y_val >= 0:
            top_pos = y_val + err + 0.6
            ax1.text(idx, top_pos, f"{y_val:+.1f}%", ha="center", va="bottom", fontsize=10.5, fontweight="bold", color="#0F172A", zorder=5)
            ax1.text(idx, top_pos + 1.4, f"[{row['ci_low']:.1f}, {row['ci_upp']:.1f}]", ha="center", va="bottom", fontsize=8.0, color="#475569", zorder=5)
        else:
            bot_pos = y_val - err - 0.7
            ax1.text(idx, bot_pos, f"{y_val:+.1f}%", ha="center", va="top", fontsize=10.5, fontweight="bold", color="#0F172A", zorder=5)
            ax1.text(idx, bot_pos - 1.2, f"[{row['ci_low']:.1f}, {row['ci_upp']:.1f}]", ha="center", va="top", fontsize=8.0, color="#475569", zorder=5)
            
    ax1.set_xticks(x1)
    ax1.set_xticklabels(pers_labels, fontsize=9.5, color="#1E293B")
    ax1.set_title("Panel A: Agent Personality Profiles\n(Primary Behavioral Driver, Omnibus Wald p < 0.0001)", fontsize=11, fontweight="bold", color="#0F172A", pad=12)
    ax1.set_ylabel("Mean Deception Gap (% points)", fontsize=11, fontweight="bold", color="#0F172A", labelpad=8)
    ax1.set_ylim(y_min, y_max)
    ax1.set_yticks(np.arange(-4, 21, 4))
    ax1.set_yticklabels([f"{y}%" for y in np.arange(-4, 21, 4)], fontsize=9.5, color="#334155")
    ax1.grid(axis="y", color=grid_color, linestyle="--", linewidth=0.8, alpha=0.9, zorder=0)
    for spine in ["top", "right"]:
        ax1.spines[spine].set_visible(False)
    for spine in ["left", "bottom"]:
        ax1.spines[spine].set_color("#94A3B8")
        
    # --- SUBPLOT 2: Developer Roles ---
    ax2.set_facecolor("#FFFFFF")
    x2 = np.arange(len(role_order))
    bars2 = ax2.bar(
        x2, 
        df_roles["mean_gap"], 
        width=0.55, 
        color=bar_color_role, 
        edgecolor=edge_color_role, 
        linewidth=1.2, 
        alpha=0.90, 
        zorder=3
    )
    ax2.errorbar(
        x2, 
        df_roles["mean_gap"], 
        yerr=1.96 * df_roles["se_gap"], 
        fmt="none", 
        ecolor=err_color, 
        elinewidth=1.8, 
        capsize=6, 
        capthick=1.8, 
        zorder=4
    )
    ax2.axhline(0, color="#64748B", linewidth=1.2, linestyle="-", zorder=2)
    
    # Data labels for ax2
    for idx, row in df_roles.iterrows():
        y_val = row["mean_gap"]
        err = 1.96 * row["se_gap"]
        top_pos = y_val + err + 0.6
        ax2.text(idx, top_pos, f"{y_val:+.1f}%", ha="center", va="bottom", fontsize=10.5, fontweight="bold", color="#0F172A", zorder=5)
        ax2.text(idx, top_pos + 1.4, f"[{row['ci_low']:.1f}, {row['ci_upp']:.1f}]", ha="center", va="bottom", fontsize=8.0, color="#475569", zorder=5)
            
    ax2.set_xticks(x2)
    ax2.set_xticklabels(role_labels, fontsize=9.5, color="#1E293B")
    ax2.set_title("Panel B: Developer Roles\n(Task Context, Non-Significant, Omnibus p = 0.549)", fontsize=11, fontweight="bold", color="#0F172A", pad=12)
    ax2.set_ylim(y_min, y_max)
    ax2.set_yticks(np.arange(-4, 21, 4))
    ax2.set_yticklabels([])  # Hide tick labels since ax1 shares same scale
    ax2.grid(axis="y", color=grid_color, linestyle="--", linewidth=0.8, alpha=0.9, zorder=0)
    for spine in ["top", "right"]:
        ax2.spines[spine].set_visible(False)
    for spine in ["left", "bottom"]:
        ax2.spines[spine].set_color("#94A3B8")
        
    # Suptitle and Caption
    plt.suptitle("FIGURE 4.6: ROLE OR PROFILE COMPARISON", fontsize=13.5, fontweight="bold", color="#0F172A", y=0.98)
    
    # Subtitle note
    fig.text(
        0.5, 0.02,
        "Metric: Deception Gap = Reported Progress (%) - Actual Progress (%) | Error bars: 95% Confidence Intervals (N = 2,400 observations across 600 execution runs)\n"
        "Interpretation: Positive = Over-reporting (exaggeration); Negative = Under-reporting (sandbagging); 0% = Veridical reporting.",
        ha="center", fontsize=8.5, color="#475569", linespacing=1.3
    )
    
    plt.tight_layout(rect=[0, 0.06, 1, 0.94])
    
    png_path = os.path.join(base_dir, "figure_4_6_role_profile_comparison.png")
    png_alt = os.path.join(base_dir, "role_profile_comparison.png")
    plt.savefig(png_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.savefig(png_alt, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print(f"Exported PNG to: {png_path} and {png_alt}")

if __name__ == "__main__":
    main()
