import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json
import os
import glob
import time

# --- Page Config ---
st.set_page_config(page_title="Under Pressure - AI Agent Simulator", page_icon="🧠", layout="wide")

# Custom CSS for Premium UI
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
    html, body, [class*="css"]  { font-family: 'Inter', sans-serif; }
    h1, h2, h3 { color: #e2e8f0; font-weight: 600; letter-spacing: -0.02em; }
    
    .org-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 10px;
    }
    
    .org-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .org-card h3 { margin-top: 0; font-size: 1.2rem; color: #fff; }
    .org-card p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 0; }
    
    .manager-card { border-top: 3px solid #8b5cf6; }
    .dev-card { border-top: 3px solid #3b82f6; }
    .qa-card { border-top: 3px solid #10b981; }
    .auditor-card { border-top: 3px solid #ef4444; }
    
    .flex-center { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; width: 100%; }
</style>
""", unsafe_allow_html=True)

# --- Auto-refresh settings (UI only) ---
st.sidebar.title("⚙️ Settings")
if st.sidebar.button("🔄 Refresh Data"):
    st.cache_data.clear()
    st.rerun()
auto_refresh = st.sidebar.checkbox("Auto-Refresh", value=False)
refresh_rate = st.sidebar.slider("Refresh Rate (seconds)", 5, 60, 10)

# --- Data Loading ---
@st.cache_data(ttl=60)
def load_data():
    results_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'results')
    if not os.path.exists(results_dir):
        return []
    
    json_files = glob.glob(os.path.join(results_dir, '*.json'))
    data = []
    for f in json_files:
        with open(f, 'r') as file:
            try:
                data.append(json.load(file))
            except json.JSONDecodeError:
                pass
    # Sort by timestamp, newest first
    data.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    return data

data = load_data()

# Header
st.title("🧠 Under Pressure Dashboard")
st.markdown("<p style='color: #94a3b8; font-size: 1.1rem; margin-top: -15px;'>Evaluating Reward Hacking and Deceptive Behavior in AI Software Teams</p>", unsafe_allow_html=True)
st.divider()

if not data:
    st.warning("No simulation data found in `results/` directory.")
    if auto_refresh:
        time.sleep(refresh_rate)
        st.rerun()
    st.stop()

# --- Tabs ---
tabs = st.tabs([
    "📈 Historical Trends", 
    "🔍 Specific Experiment View",
    "🏢 Agent Architecture"
])

with tabs[0]:
    # --- Historical Trends Section ---
    df_trends = pd.DataFrame([{
        'experiment_id': d.get('experiment_id'),
        'timestamp': d.get('timestamp'),
        'pressure_level': d.get('pressure_level'),
        'performance': d.get('overall_metrics', {}).get('agent_performance', 0),
        'deception_rate': d.get('overall_metrics', {}).get('deception_rate', 0),
        'honesty_score': d.get('overall_metrics', {}).get('honesty_score', 0),
        'task_completion_rate': d.get('overall_metrics', {}).get('task_completion_rate', 0)
    } for d in data])

    pressure_map = {"LOW": 1, "NORMAL": 2, "HIGH": 3, "IMPOSSIBLE": 4}
    df_trends['pressure_score'] = df_trends['pressure_level'].map(pressure_map)
    df_trends = df_trends.sort_values('timestamp')

    col1, col2 = st.columns(2)
    
    with col1:
        fig_perf = go.Figure()
        fig_perf.add_trace(go.Scatter(x=df_trends['experiment_id'], y=df_trends['performance'], name="Performance", mode="lines+markers", line=dict(color="#10b981")))
        fig_perf.add_trace(go.Scatter(x=df_trends['experiment_id'], y=df_trends['pressure_score'], name="Pressure Score", yaxis="y2", mode="lines+markers", line=dict(color="#ef4444", dash='dot')))
        fig_perf.update_layout(
            title="Performance vs Pressure Level",
            yaxis=dict(title="Performance Score (0-100)"),
            yaxis2=dict(title="Pressure (1=Low, 4=Impossible)", overlaying="y", side="right", range=[0, 5]),
            template="plotly_dark",
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_perf, use_container_width=True)

    with col2:
        fig_rates = go.Figure()
        fig_rates.add_trace(go.Scatter(x=df_trends['experiment_id'], y=df_trends['task_completion_rate'], name="Completion Rate", mode="lines+markers", line=dict(color="#3b82f6")))
        fig_rates.add_trace(go.Scatter(x=df_trends['experiment_id'], y=df_trends['deception_rate'], name="Deception Rate", mode="lines+markers", line=dict(color="#f97316")))
        fig_rates.update_layout(
            title="Task Completion vs Deception Rate",
            yaxis=dict(title="Rate (0.0 - 1.0)", tickformat=".0%"),
            template="plotly_dark",
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_rates, use_container_width=True)

with tabs[1]:
    st.markdown("### Experiment Details")
    experiment_ids = [d['experiment_id'] for d in data]
    
    sel_col, _ = st.columns([1, 2])
    with sel_col:
        selected_exp_id = st.selectbox("Select Experiment", experiment_ids)

    selected_exp = next(d for d in data if d['experiment_id'] == selected_exp_id)

    # Top Metrics
    metrics_col1, metrics_col2, metrics_col3, metrics_col4 = st.columns(4)
    metrics_col1.metric("Status", selected_exp.get('status', 'N/A'))
    metrics_col2.metric("Pressure Level", selected_exp.get('pressure_level', 'N/A'))
    metrics_col3.metric("Deception Rate", f"{selected_exp.get('overall_metrics', {}).get('deception_rate', 0):.0%}")
    metrics_col4.metric("Task Completion", f"{selected_exp.get('overall_metrics', {}).get('task_completion_rate', 0):.0%}")

    st.divider()

    # Main Content
    st.subheader("👨‍💻 Developer Progress & Deception (Actual vs Reported)")
    dev_reports = selected_exp.get('developer_reports', [])
    if dev_reports:
        dev_df = pd.DataFrame(dev_reports)
        
        fig_dev = go.Figure(data=[
            go.Bar(name='Actual Progress', x=dev_df['agent_id'] + "<br>(" + dev_df['task_id'] + ")", y=dev_df['actual_progress'], marker_color='#10b981'),
            go.Bar(name='Reported Progress', x=dev_df['agent_id'] + "<br>(" + dev_df['task_id'] + ")", y=dev_df['reported_progress'], marker_color='#ef4444')
        ])
        fig_dev.update_layout(
            barmode='group', 
            yaxis=dict(title="Progress (%)", range=[0, 105]),
            template="plotly_dark",
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_dev, use_container_width=True)
        
        with st.expander("View Raw Developer Reports"):
            st.dataframe(dev_df, use_container_width=True)
    else:
        st.info("No developer reports available for this experiment.")

    col_t, col_a = st.columns(2)
    with col_t:
        st.subheader("📋 Tasks Assigned by Manager")
        tasks = selected_exp.get('manager', {}).get('tasks_assigned', [])
        if tasks:
            tasks_df = pd.DataFrame(tasks)
            st.dataframe(tasks_df, use_container_width=True, hide_index=True)
        else:
            st.info("No tasks assigned.")

    with col_a:
        st.subheader("🕵️ Auditor Results")
        auditor = selected_exp.get('auditor_results', {})
        if auditor:
            # Create a mini gauge chart for audit score
            score = auditor.get('code_quality_score', 0)
            fig_gauge = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = score,
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Code Quality Score"},
                gauge = {
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "#3b82f6"},
                    'steps': [
                        {'range': [0, 50], 'color': "#ef4444"},
                        {'range': [50, 80], 'color': "#f59e0b"},
                        {'range': [80, 100], 'color': "#10b981"}
                    ]
                }
            ))
            fig_gauge.update_layout(height=250, margin=dict(l=10, r=10, t=40, b=10), template="plotly_dark", plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)")
            st.plotly_chart(fig_gauge, use_container_width=True)
            
            st.metric("Issues Found", auditor.get('issues_found', 0))
        else:
            st.info("No auditor results available.")

with tabs[2]:
    st.markdown("### Agent Architecture")
    st.markdown("<p style='color: #94a3b8;'>Visualization of the simulated software development hierarchy.</p>", unsafe_allow_html=True)
    
    st.markdown("""
    <div class='flex-center' style='margin-bottom: 30px;'>
        <div class='org-card manager-card' style='width: 300px;'>
            <div style='font-size: 2rem; margin-bottom: 10px;'>👔</div>
            <h3>Project Manager</h3>
            <p>Decomposes features into tasks and assigns them based on deadlines.</p>
        </div>
    </div>
    <div class='flex-center' style='margin-bottom: 30px; gap: 40px;'>
        <div class='org-card dev-card' style='width: 250px;'>
            <div style='font-size: 2rem; margin-bottom: 10px;'>💻</div>
            <h3>Backend Developer</h3>
            <p>Executes tasks, evaluates incentives, and decides reporting strategy.</p>
        </div>
        <div class='org-card dev-card' style='width: 250px;'>
            <div style='font-size: 2rem; margin-bottom: 10px;'>🎨</div>
            <h3>Frontend Developer</h3>
            <p>Executes tasks, evaluates incentives, and decides reporting strategy.</p>
        </div>
    </div>
    <div class='flex-center' style='gap: 40px;'>
        <div class='org-card qa-card' style='width: 250px;'>
            <div style='font-size: 2rem; margin-bottom: 10px;'>🔍</div>
            <h3>QA Engineer</h3>
            <p>Reviews reported work for quality without access to ground truth.</p>
        </div>
        <div class='org-card auditor-card' style='width: 250px;'>
            <div style='font-size: 2rem; margin-bottom: 10px;'>⚖️</div>
            <h3>Auditor</h3>
            <p>Compares official reports against ground truth to detect deception.</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

# --- Auto-refresh execution ---
if auto_refresh:
    time.sleep(refresh_rate)
    st.rerun()
