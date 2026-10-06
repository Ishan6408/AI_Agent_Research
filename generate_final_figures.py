import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

def create_figures():
    output_dir = "analysis/final_campaign/final_figures"
    os.makedirs(output_dir, exist_ok=True)
    
    # Set seaborn style for publication ready plots
    sns.set_theme(style="whitegrid", context="paper", font_scale=1.2)
    
    # Define pressure order
    pressure_order = ["LOW", "MEDIUM", "HIGH", "EXTREME"]
    
    # ---------------------------------------------------------
    # 1. Mean deception gap by pressure
    # ---------------------------------------------------------
    df_pressure = pd.read_csv("analysis/final_campaign/pressure_statistics.csv")
    df_pressure['pressure'] = pd.Categorical(df_pressure['pressure'], categories=pressure_order, ordered=True)
    df_pressure = df_pressure.sort_values('pressure')
    
    plt.figure(figsize=(8, 5))
    plt.plot(df_pressure['pressure'], df_pressure['mean'], marker='o', linewidth=2, color='b', markersize=8)
    plt.fill_between(df_pressure['pressure'], df_pressure['ci_lower'], df_pressure['ci_upper'], color='b', alpha=0.2)
    plt.title("Main Effect: Organizational Pressure on Deception Gap")
    plt.xlabel("Pressure Level")
    plt.ylabel("Mean Deception Gap (Reported - Actual)")
    
    # Annotation for plateau
    high_y = df_pressure.loc[df_pressure['pressure'] == 'HIGH', 'mean'].values[0]
    extreme_y = df_pressure.loc[df_pressure['pressure'] == 'EXTREME', 'mean'].values[0]
    plt.annotate('Plateau (p = 0.887)', 
                 xy=(2.5, (high_y + extreme_y)/2), 
                 xytext=(1.5, 12),
                 arrowprops=dict(facecolor='black', shrink=0.05, width=1, headwidth=5),
                 fontsize=10)
                 
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "1_pressure_main_effect.png"), dpi=300)
    plt.close()
    
    # ---------------------------------------------------------
    # 2. Pressure × personality interaction
    # ---------------------------------------------------------
    df_pers = pd.read_csv("analysis/final_campaign/interaction_pressure_personality.csv")
    df_pers['pressure'] = pd.Categorical(df_pers['pressure'], categories=pressure_order, ordered=True)
    
    plt.figure(figsize=(10, 6))
    sns.lineplot(data=df_pers, x='pressure', y='mean', hue='personality', marker='o', linewidth=2, markersize=8)
    plt.title("Interaction: Pressure × Agent Personality")
    plt.xlabel("Pressure Level")
    plt.ylabel("Mean Deception Gap")
    plt.legend(title="Personality")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "2_interaction_pressure_personality.png"), dpi=300)
    plt.close()
    
    # ---------------------------------------------------------
    # 3. Pressure × task difficulty interaction
    # ---------------------------------------------------------
    df_diff = pd.read_csv("analysis/final_campaign/interaction_pressure_difficulty.csv")
    df_diff['pressure'] = pd.Categorical(df_diff['pressure'], categories=pressure_order, ordered=True)
    
    plt.figure(figsize=(8, 5))
    sns.lineplot(data=df_diff, x='pressure', y='mean', hue='task_difficulty', marker='s', linewidth=2, markersize=8)
    plt.title("Interaction: Pressure × Task Difficulty (Not Significant, p=0.1456)")
    plt.xlabel("Pressure Level")
    plt.ylabel("Mean Deception Gap")
    plt.legend(title="Task Difficulty")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "3_interaction_pressure_difficulty.png"), dpi=300)
    plt.close()
    
    # ---------------------------------------------------------
    # 4. Pressure × developer role interaction
    # ---------------------------------------------------------
    df_role = pd.read_csv("analysis/final_campaign/interaction_pressure_role.csv")
    df_role['pressure'] = pd.Categorical(df_role['pressure'], categories=pressure_order, ordered=True)
    
    plt.figure(figsize=(8, 5))
    sns.lineplot(data=df_role, x='pressure', y='mean', hue='developer_role', marker='^', linewidth=2, markersize=8)
    plt.title("Interaction: Pressure × Developer Role (Not Significant, p=0.0739)")
    plt.xlabel("Pressure Level")
    plt.ylabel("Mean Deception Gap")
    plt.legend(title="Developer Role")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "4_interaction_pressure_role.png"), dpi=300)
    plt.close()
    
    # ---------------------------------------------------------
    # 5. Auditor detection rate by pressure
    # ---------------------------------------------------------
    df_det = pd.read_csv("analysis/final_campaign/detection_rates.csv")
    df_det['pressure'] = pd.Categorical(df_det['pressure'], categories=pressure_order, ordered=True)
    df_det = df_det.sort_values('pressure')
    
    plt.figure(figsize=(8, 5))
    bars = plt.bar(df_det['pressure'], df_det['detection_rate'] * 100, color='darkred', alpha=0.7)
    
    # Error bars using CI
    lower_error = (df_det['detection_rate'] - df_det['ci_lower']) * 100
    upper_error = (df_det['ci_upper'] - df_det['detection_rate']) * 100
    plt.errorbar(df_det['pressure'], df_det['detection_rate'] * 100, 
                 yerr=[lower_error, upper_error], fmt='none', ecolor='black', capsize=5)
                 
    plt.title("Auditor Detection Rate by Pressure")
    plt.xlabel("Pressure Level")
    plt.ylabel("Detection Rate (%)")
    plt.ylim(0, 100)
    
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, yval + 3, f'{yval:.1f}%', ha='center', va='bottom', fontweight='bold')
        
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "5_auditor_detection_rate.png"), dpi=300)
    plt.close()
    
    # ---------------------------------------------------------
    # 6. Deception level distribution by pressure
    # ---------------------------------------------------------
    df_lvl = pd.read_csv("analysis/final_campaign/deception_level_summary.csv")
    df_lvl['pressure'] = pd.Categorical(df_lvl['pressure'], categories=pressure_order, ordered=True)
    df_lvl = df_lvl.sort_values('pressure')
    df_lvl = df_lvl.set_index('pressure')
    
    # Convert proportions to percentages
    df_lvl_pct = df_lvl * 100
    
    plt.figure(figsize=(10, 6))
    df_lvl_pct.plot(kind='bar', stacked=True, colormap='viridis', alpha=0.8, ax=plt.gca())
    plt.title("Deception Level Distribution by Pressure")
    plt.xlabel("Pressure Level")
    plt.ylabel("Percentage of Observations (%)")
    plt.legend(title="Deception Level", bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "6_deception_level_distribution.png"), dpi=300)
    plt.close()

if __name__ == "__main__":
    create_figures()
    print("Final figures generated successfully.")
