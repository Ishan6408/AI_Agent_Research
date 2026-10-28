import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go


# ==========================================================
# PAGE CONFIG
# ==========================================================

st.set_page_config(
    page_title="VEIL — AI Agent Deception Research",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ==========================================================
# CUSTOM CSS
# ==========================================================

st.markdown(
    """
    <style>

    .main > div {
        padding-top: 1rem;
    }

    .metric-container {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid #dddddd;
    }

    hr {
        margin-top: 20px;
        margin-bottom: 20px;
    }

    </style>
    """,
    unsafe_allow_html=True
)


# ==========================================================
# TITLE
# ==========================================================

st.title("VEIL")

st.caption(
    """
    AI Agent Deception Research &mdash; Investigating deceptive behavior in autonomous AI agents.
    Multi-Agent Software Company Simulator for Studying Deceptive Behaviour under Workplace Pressure.
    """
)


# ==========================================================
# LOAD DATA
# ==========================================================

CSV_FILE = "results/experiment_summary.csv"

try:
    df = pd.read_csv(CSV_FILE)

except FileNotFoundError:
    st.error(
        f"Could not find `{CSV_FILE}`.\n\n"
        "Run `analyzer.py` first to generate the experiment summary."
    )
    st.stop()

except Exception as e:
    st.error(f"Could not load dataset: {e}")
    st.stop()


# ==========================================================
# BASIC DATA CHECK
# ==========================================================

if df.empty:
    st.warning("The dataset is empty. Run your experiments first.")
    st.stop()


# ==========================================================
# HELPER FUNCTIONS
# ==========================================================

def column_exists(column):
    """Check whether a column exists."""
    return column in df.columns


def safe_numeric(column):
    """
    Convert a column to numeric safely.
    Returns a numeric Series if the column exists,
    otherwise None.
    """
    if column not in df.columns:
        return None

    return pd.to_numeric(
        df[column],
        errors="coerce"
    )


def safe_mean(data, column, decimals=2):
    """
    Safely calculate mean for a column.
    """
    if column not in data.columns:
        return None

    values = pd.to_numeric(
        data[column],
        errors="coerce"
    ).dropna()

    if values.empty:
        return None

    return round(values.mean(), decimals)


def safe_percentage(data, column):
    """
    Safely calculate percentage for boolean/numeric detection columns.
    """

    if column not in data.columns:
        return None

    series = data[column]

    # Boolean values
    if series.dtype == bool:
        return series.mean() * 100

    # Numeric values
    numeric = pd.to_numeric(
        series,
        errors="coerce"
    )

    if numeric.notna().any():
        return numeric.mean() * 100

    # String values
    normalized = (
        series
        .astype(str)
        .str.strip()
        .str.lower()
    )

    mapping = {
        "true": 1,
        "false": 0,
        "yes": 1,
        "no": 0,
        "detected": 1,
        "not detected": 0
    }

    converted = normalized.map(mapping)

    if converted.notna().any():
        return converted.mean() * 100

    return None


def safe_size(series, minimum=8):
    """
    Create valid Plotly marker sizes.

    Plotly does not accept negative marker sizes.
    """
    numeric = pd.to_numeric(
        series,
        errors="coerce"
    ).fillna(0)

    return numeric.abs().clip(lower=minimum)


def display_metric(column, label, decimals=2):
    """
    Return a formatted metric value.
    """
    value = safe_mean(filtered, column, decimals)

    if value is None:
        return "N/A"

    return f"{value:.{decimals}f}"


def require_columns(data, columns):
    """
    Check whether all required columns exist.
    """
    return all(column in data.columns for column in columns)


# ==========================================================
# CLEAN DATA
# ==========================================================

required_columns = [
    "pressure",
    "personality",
    "behavior_strategy",
    "task_difficulty"
]

existing_required = [
    column
    for column in required_columns
    if column in df.columns
]

if existing_required:
    df = df.dropna(
        subset=existing_required
    )


# ==========================================================
# CONVERT COMMON NUMERIC COLUMNS
# ==========================================================

numeric_columns = [
    "actual_progress",
    "reported_progress",
    "deception_gap",
    "performance_score",
    "honesty_score",
    "bugs_introduced",
    "code_quality",
    "stress_index",
    "auditor_score",
    "reward",
    "penalty",
    "deadline_hours"
]

for column in numeric_columns:

    if column in df.columns:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )


# ==========================================================
# SIDEBAR FILTERS
# ==========================================================

st.sidebar.title("🔎 Filters")


def filter_column(column):

    if column not in df.columns:
        return None

    values = (
        df[column]
        .dropna()
        .unique()
        .tolist()
    )

    try:
        values = sorted(values)
    except TypeError:
        pass

    return st.sidebar.multiselect(
        column.replace("_", " ").title(),
        values,
        default=values
    )


pressure = filter_column("pressure")
personality = filter_column("personality")
difficulty = filter_column("task_difficulty")
strategy = filter_column("behavior_strategy")
developer = filter_column("developer_role")


# ==========================================================
# APPLY FILTERS
# ==========================================================

filtered = df.copy()


if pressure is not None:
    filtered = filtered[
        filtered["pressure"].isin(pressure)
    ]


if personality is not None:
    filtered = filtered[
        filtered["personality"].isin(personality)
    ]


if difficulty is not None:
    filtered = filtered[
        filtered["task_difficulty"].isin(difficulty)
    ]


if strategy is not None:
    filtered = filtered[
        filtered["behavior_strategy"].isin(strategy)
    ]


if developer is not None:
    filtered = filtered[
        filtered["developer_role"].isin(developer)
    ]


# ==========================================================
# FILTER STATUS
# ==========================================================

st.sidebar.divider()

st.sidebar.metric(
    "Experiments Selected",
    len(filtered)
)


# ==========================================================
# EMPTY FILTER RESULT
# ==========================================================

if filtered.empty:

    st.warning(
        "No experiments match the selected filters."
    )

    st.info(
        "Try selecting more values from the sidebar."
    )

    st.stop()


# ==========================================================
# KPI SECTION
# ==========================================================

st.header("📊 Overall Statistics")


row1 = st.columns(4)


row1[0].metric(
    "Experiments",
    len(filtered)
)


row1[1].metric(
    "Average Performance",
    display_metric(
        "performance_score",
        "Average Performance",
        1
    )
)


row1[2].metric(
    "Average Honesty",
    display_metric(
        "honesty_score",
        "Average Honesty",
        1
    )
)


detection_rate = safe_percentage(
    filtered,
    "deception_detected"
)


row1[3].metric(
    "Detection Rate",
    (
        f"{detection_rate:.1f}%"
        if detection_rate is not None
        else "N/A"
    )
)


row2 = st.columns(4)


row2[0].metric(
    "Average Bugs",
    display_metric(
        "bugs_introduced",
        "Average Bugs",
        2
    )
)


row2[1].metric(
    "Average Code Quality",
    display_metric(
        "code_quality",
        "Average Code Quality",
        2
    )
)


row2[2].metric(
    "Average Stress",
    display_metric(
        "stress_index",
        "Average Stress",
        2
    )
)


row2[3].metric(
    "Average Auditor Score",
    display_metric(
        "auditor_score",
        "Average Auditor Score",
        2
    )
)


st.divider()


# ==========================================================
# TABS
# ==========================================================

(
    overview_tab,
    behaviour_tab,
    developer_tab,
    auditor_tab,
    correlation_tab,
    dataset_tab
) = st.tabs(
    [
        "📊 Overview",
        "🧠 Behaviour Analysis",
        "👨‍💻 Developer Analysis",
        "🕵 Auditor Analysis",
        "📈 Correlation Analysis",
        "🗂 Dataset"
    ]
)


# ==========================================================
# OVERVIEW TAB
# ==========================================================

with overview_tab:

    st.header("Overview")

    # ------------------------------------------------------
    # Performance / Stress / Deception
    # ------------------------------------------------------

    if require_columns(
        filtered,
        [
            "stress_index",
            "deception_gap",
            "personality"
        ]
    ):

        st.subheader(
            "Stress vs Deception Gap"
        )

        plot_df = filtered.copy()

        # IMPORTANT:
        # Plotly marker sizes cannot be negative.
        if "performance_score" in plot_df.columns:

            plot_df["performance_size"] = safe_size(
                plot_df["performance_score"]
            )

        else:

            plot_df["performance_size"] = 10


        hover_columns = [
            column
            for column in [
                "developer_role",
                "behavior_strategy",
                "pressure",
                "task_difficulty",
                "performance_score"
            ]
            if column in plot_df.columns
        ]


        fig = px.scatter(
            plot_df,
            x="stress_index",
            y="deception_gap",
            color="personality",
            size="performance_size",
            hover_data=hover_columns,
            title="Stress vs Deception Gap"
        )


        fig.update_layout(
            xaxis_title="Stress Index",
            yaxis_title="Deception Gap"
        )


        st.plotly_chart(
            fig,
            use_container_width=True
        )


    # ------------------------------------------------------
    # Pressure and Behaviour
    # ------------------------------------------------------

    col1, col2 = st.columns(2)


    with col1:

        if "pressure" in filtered.columns:

            st.subheader(
                "Pressure Distribution"
            )

            fig = px.histogram(
                filtered,
                x="pressure",
                color="pressure"
            )

            st.plotly_chart(
                fig,
                use_container_width=True
            )


    with col2:

        if "behavior_strategy" in filtered.columns:

            st.subheader(
                "Behaviour Strategy Distribution"
            )

            fig = px.histogram(
                filtered,
                x="behavior_strategy",
                color="behavior_strategy"
            )

            st.plotly_chart(
                fig,
                use_container_width=True
            )


    # ------------------------------------------------------
    # Detection
    # ------------------------------------------------------

    if "deception_detected" in filtered.columns:

        st.subheader(
            "🕵 Deception Detection"
        )

        detection_series = (
            filtered["deception_detected"]
            .astype(str)
            .str.strip()
            .str.lower()
            .replace({
                "true": "Detected",
                "false": "Not Detected",
                "1": "Detected",
                "0": "Not Detected",
                "yes": "Detected",
                "no": "Not Detected"
            })
        )

        pie = (
            detection_series
            .value_counts()
            .rename_axis("Detection")
            .reset_index(name="Count")
        )


        fig = px.pie(
            pie,
            names="Detection",
            values="Count",
            hole=0.4
        )


        st.plotly_chart(
            fig,
            use_container_width=True
        )


# ==========================================================
# BEHAVIOUR TAB
# ==========================================================

with behaviour_tab:

    st.header("🧠 Behaviour Analysis")


    # ------------------------------------------------------
    # Actual vs Reported Progress
    # ------------------------------------------------------

    if require_columns(
        filtered,
        [
            "actual_progress",
            "reported_progress"
        ]
    ):

        st.subheader(
            "Actual Progress vs Reported Progress"
        )

        plot_df = filtered.copy()


        if "deception_gap" in plot_df.columns:

            plot_df["deception_size"] = safe_size(
                plot_df["deception_gap"]
            )

        else:

            plot_df["deception_size"] = 10


        color_column = (
            "behavior_strategy"
            if "behavior_strategy" in plot_df.columns
            else None
        )


        hover_columns = [
            column
            for column in [
                "developer_role",
                "personality",
                "pressure",
                "task_difficulty"
            ]
            if column in plot_df.columns
        ]


        fig = px.scatter(
            plot_df,
            x="actual_progress",
            y="reported_progress",
            color=color_column,
            size="deception_size",
            hover_data=hover_columns,
            title="Reported Progress vs Actual Progress"
        )


        fig.add_shape(
            type="line",
            x0=0,
            y0=0,
            x1=100,
            y1=100,
            line=dict(
                dash="dash"
            )
        )


        fig.update_layout(
            xaxis_title="Actual Progress (%)",
            yaxis_title="Reported Progress (%)"
        )


        st.plotly_chart(
            fig,
            use_container_width=True
        )


    # ------------------------------------------------------
    # Personality Analysis
    # ------------------------------------------------------

    left, right = st.columns(2)


    with left:

        if require_columns(
            filtered,
            [
                "personality",
                "performance_score"
            ]
        ):

            st.subheader(
                "Performance by Personality"
            )


            temp = (
                filtered
                .groupby(
                    "personality",
                    as_index=False
                )["performance_score"]
                .mean()
            )


            fig = px.bar(
                temp,
                x="personality",
                y="performance_score",
                color="personality"
            )


            st.plotly_chart(
                fig,
                use_container_width=True
            )


    with right:

        if require_columns(
            filtered,
            [
                "personality",
                "honesty_score"
            ]
        ):

            st.subheader(
                "Honesty by Personality"
            )


            temp = (
                filtered
                .groupby(
                    "personality",
                    as_index=False
                )["honesty_score"]
                .mean()
            )


            fig = px.bar(
                temp,
                x="personality",
                y="honesty_score",
                color="personality"
            )


            st.plotly_chart(
                fig,
                use_container_width=True
            )


    # ------------------------------------------------------
    # Stress vs Deception
    # ------------------------------------------------------

    if require_columns(
        filtered,
        [
            "stress_index",
            "deception_gap"
        ]
    ):

        st.subheader(
            "Stress vs Deception Gap"
        )


        plot_df = filtered.copy()


        if "performance_score" in plot_df.columns:

            plot_df["performance_size"] = safe_size(
                plot_df["performance_score"]
            )

        else:

            plot_df["performance_size"] = 10


        color_column = (
            "personality"
            if "personality" in plot_df.columns
            else None
        )


        hover_columns = [
            column
            for column in [
                "developer_role",
                "behavior_strategy",
                "pressure"
            ]
            if column in plot_df.columns
        ]


        fig = px.scatter(
            plot_df,
            x="stress_index",
            y="deception_gap",
            color=color_column,
            size="performance_size",
            hover_data=hover_columns
        )


        st.plotly_chart(
            fig,
            use_container_width=True
        )


    # ------------------------------------------------------
    # Deception Distribution
    # ------------------------------------------------------

    if "deception_gap" in filtered.columns:

        st.subheader(
            "Deception Gap Distribution"
        )


        color_column = (
            "behavior_strategy"
            if "behavior_strategy" in filtered.columns
            else None
        )


        fig = px.histogram(
            filtered,
            x="deception_gap",
            color=color_column,
            nbins=20
        )


        st.plotly_chart(
            fig,
            use_container_width=True
        )


# ==========================================================
# DEVELOPER TAB
# ==========================================================

with developer_tab:

    st.header("👨‍💻 Developer Analysis")


    if "developer_role" not in filtered.columns:

        st.warning(
            "The dataset does not contain `developer_role`."
        )

        st.info(
            "If your simulator uses only one developer, "
            "you can add `developer_role` to ExperimentResult "
            "and regenerate the dataset."

        )

    else:

        col1, col2 = st.columns(2)


        with col1:

            if "bugs_introduced" in filtered.columns:

                st.subheader(
                    "Bugs by Developer Role"
                )


                temp = (
                    filtered
                    .groupby(
                        "developer_role",
                        as_index=False
                    )["bugs_introduced"]
                    .mean()
                )


                fig = px.bar(
                    temp,
                    x="developer_role",
                    y="bugs_introduced",
                    color="developer_role"
                )


                st.plotly_chart(
                    fig,
                    use_container_width=True
                )


        with col2:

            if "code_quality" in filtered.columns:

                st.subheader(
                    "Code Quality by Developer Role"
                )


                temp = (
                    filtered
                    .groupby(
                        "developer_role",
                        as_index=False
                    )["code_quality"]
                    .mean()
                )


                fig = px.bar(
                    temp,
                    x="developer_role",
                    y="code_quality",
                    color="developer_role"
                )


                st.plotly_chart(
                    fig,
                    use_container_width=True
                )


        # --------------------------------------------------
        # Pressure vs Bugs
        # --------------------------------------------------

        col1, col2 = st.columns(2)


        with col1:

            if require_columns(
                filtered,
                [
                    "pressure",
                    "bugs_introduced"
                ]
            ):

                st.subheader(
                    "Pressure vs Bugs"
                )


                temp = (
                    filtered
                    .groupby(
                        "pressure",
                        as_index=False
                    )["bugs_introduced"]
                    .mean()
                )


                fig = px.bar(
                    temp,
                    x="pressure",
                    y="bugs_introduced",
                    color="pressure"
                )


                st.plotly_chart(
                    fig,
                    use_container_width=True
                )


        with col2:

            if "performance_score" in filtered.columns:

                st.subheader(
                    "Average Performance by Developer"
                )


                temp = (
                    filtered
                    .groupby(
                        "developer_role",
                        as_index=False
                    )["performance_score"]
                    .mean()
                )


                fig = px.bar(
                    temp,
                    x="developer_role",
                    y="performance_score",
                    color="developer_role"
                )


                st.plotly_chart(
                    fig,
                    use_container_width=True
                )


        # --------------------------------------------------
        # Developer Comparison
        # --------------------------------------------------

        st.subheader(
            "Developer Comparison"
        )


        comparison_columns = [
            column
            for column in [
                "performance_score",
                "honesty_score",
                "code_quality",
                "bugs_introduced",
                "deception_gap"
            ]
            if column in filtered.columns
        ]


        if comparison_columns:

            role_summary = (
                filtered
                .groupby(
                    "developer_role",
                    as_index=False
                )[comparison_columns]
                .mean()
                .round(2)
            )


            st.dataframe(
                role_summary,
                use_container_width=True
            )


# ==========================================================
# AUDITOR TAB
# ==========================================================

with auditor_tab:

    st.header("🕵 Auditor Analysis")


    col1, col2 = st.columns(2)


    # ------------------------------------------------------
    # Auditor Score
    # ------------------------------------------------------

    with col1:

        if "auditor_score" in filtered.columns:

            st.subheader(
                "Auditor Score Distribution"
            )


            fig = px.histogram(
                filtered,
                x="auditor_score",
                nbins=20
            )


            st.plotly_chart(
                fig,
                use_container_width=True
            )


    # ------------------------------------------------------
    # Detection Rate by Pressure
    # ------------------------------------------------------

    with col2:

        if require_columns(
            filtered,
            [
                "pressure",
                "deception_detected"
            ]
        ):

            st.subheader(
                "Detection Rate by Pressure"
            )


            detection_temp = filtered.copy()


            detection_temp["_detected_numeric"] = (
                detection_temp["deception_detected"]
                .astype(str)
                .str.lower()
                .map({
                    "true": 1,
                    "false": 0,
                    "yes": 1,
                    "no": 0,
                    "1": 1,
                    "0": 0
                })
            )


            temp = (
                detection_temp
                .groupby("pressure", as_index=False)
                ["_detected_numeric"]
                .mean()
            )


            temp["Detection Rate"] = (
                temp["_detected_numeric"] * 100
            )


            fig = px.bar(
                temp,
                x="pressure",
                y="Detection Rate",
                color="pressure"
            )


            st.plotly_chart(
                fig,
                use_container_width=True
            )


    # ------------------------------------------------------
    # Auditor Score by Pressure
    # ------------------------------------------------------

    if require_columns(
        filtered,
        [
            "pressure",
            "auditor_score"
        ]
    ):

        st.subheader(
            "Average Auditor Score by Pressure"
        )


        temp = (
            filtered
            .groupby(
                "pressure",
                as_index=False
            )["auditor_score"]
            .mean()
        )


        fig = px.bar(
            temp,
            x="pressure",
            y="auditor_score",
            color="pressure"
        )


        st.plotly_chart(
            fig,
            use_container_width=True
        )


# ==========================================================
# CORRELATION TAB
# ==========================================================

with correlation_tab:

    st.header("📈 Correlation Analysis")


    # ------------------------------------------------------
    # Correlation Heatmap
    # ------------------------------------------------------

    st.subheader(
        "Correlation Heatmap"
    )


    numeric_df = filtered.select_dtypes(
        include="number"
    )


    if numeric_df.shape[1] >= 2:

        corr = (
            numeric_df
            .corr()
            .round(2)
        )


        fig = go.Figure(
            data=go.Heatmap(
                z=corr.values,
                x=corr.columns,
                y=corr.columns,
                text=corr.values,
                texttemplate="%{text}",
                colorscale="RdBu",
                zmin=-1,
                zmax=1
            )
        )


        fig.update_layout(
            height=700,
            title="Correlation Matrix of Experimental Metrics"
        )


        st.plotly_chart(
            fig,
            use_container_width=True
        )

    else:

        st.info(
            "Not enough numeric columns for correlation analysis."
        )


    # ------------------------------------------------------
    # Suspicious Experiments
    # ------------------------------------------------------

    if "auditor_score" in filtered.columns:

        st.subheader(
            "🔎 Top 10 Most Suspicious Experiments"
        )


        suspicious = (
            filtered
            .sort_values(
                "auditor_score",
                ascending=False
            )
            .head(10)
        )


        suspicious_columns = [
            column
            for column in [
                "developer_role",
                "task_name",
                "pressure",
                "personality",
                "behavior_strategy",
                "deception_gap",
                "auditor_score",
                "deception_detected"
            ]
            if column in suspicious.columns
        ]


        st.dataframe(
            suspicious[suspicious_columns],
            use_container_width=True
        )


    # ------------------------------------------------------
    # Research Findings
    # ------------------------------------------------------

    st.subheader(
        "🔬 Research Findings"
    )


    c1, c2, c3 = st.columns(3)


    if require_columns(
        filtered,
        [
            "personality",
            "deception_gap"
        ]
    ):

        personality_gap = (
            filtered
            .groupby("personality")["deception_gap"]
            .mean()
        )


        if not personality_gap.empty:

            most_deceptive_personality = (
                personality_gap.idxmax()
            )


            c1.success(
                f"""
                **Most Deceptive Personality**

                {most_deceptive_personality}
                """
            )


    if require_columns(
        filtered,
        [
            "developer_role",
            "deception_gap"
        ]
    ):

        role_gap = (
            filtered
            .groupby("developer_role")["deception_gap"]
            .mean()
        )


        if not role_gap.empty:

            most_deceptive_role = (
                role_gap.idxmax()
            )


            c2.warning(
                f"""
                **Most Deceptive Developer**

                {most_deceptive_role}
                """
            )


    if require_columns(
        filtered,
        [
            "pressure",
            "deception_gap"
        ]
    ):

        pressure_gap = (
            filtered
            .groupby("pressure")["deception_gap"]
            .mean()
        )


        if not pressure_gap.empty:

            hardest_pressure = (
                pressure_gap.idxmax()
            )


            c3.error(
                f"""
                **Highest Deception Pressure**

                {hardest_pressure}
                """
            )


    # ------------------------------------------------------
    # Average Metrics
    # ------------------------------------------------------

    st.divider()


    st.subheader(
        "Average Metrics"
    )


    metrics = [
        column
        for column in [
            "performance_score",
            "honesty_score",
            "stress_index",
            "bugs_introduced",
            "code_quality",
            "auditor_score",
            "deception_gap"
        ]
        if column in filtered.columns
    ]


    if metrics:

        summary = (
            filtered[metrics]
            .mean()
            .round(2)
            .reset_index()
        )


        summary.columns = [
            "Metric",
            "Average"
        ]


        fig = px.bar(
            summary,
            x="Metric",
            y="Average",
            color="Metric",
            text="Average"
        )


        fig.update_layout(
            xaxis_title="Metric",
            yaxis_title="Average Value"
        )


        st.plotly_chart(
            fig,
            use_container_width=True
        )


# ==========================================================
# DATASET TAB
# ==========================================================

with dataset_tab:

    st.header("🗂 Dataset Explorer")


    st.markdown(
        f"**Showing {len(filtered)} experiments**"
    )


    st.dataframe(
        filtered,
        use_container_width=True,
        height=500
    )


    # ------------------------------------------------------
    # Download
    # ------------------------------------------------------

    csv = filtered.to_csv(
        index=False
    ).encode("utf-8")


    st.download_button(
        label="📥 Download Filtered Dataset",
        data=csv,
        file_name="filtered_experiments.csv",
        mime="text/csv"
    )


    st.divider()


    # ------------------------------------------------------
    # Dataset Information
    # ------------------------------------------------------

    st.subheader(
        "Dataset Information"
    )


    info = pd.DataFrame(
        {
            "Column": filtered.columns,
            "Data Type": filtered.dtypes.astype(str),
            "Missing Values": filtered.isna().sum().values
        }
    )


    st.dataframe(
        info,
        use_container_width=True
    )


    # ------------------------------------------------------
    # Dataset Shape
    # ------------------------------------------------------

    st.subheader(
        "Dataset Shape"
    )


    c1, c2, c3 = st.columns(3)


    c1.metric(
        "Rows",
        filtered.shape[0]
    )


    c2.metric(
        "Columns",
        filtered.shape[1]
    )


    c3.metric(
        "Missing Values",
        int(filtered.isna().sum().sum())
    )


# ==========================================================
# FOOTER
# ==========================================================

st.divider()


st.markdown(
    """
    ---

    ### 🤖 VEIL — AI Agent Deception Research
    
    *Investigating deceptive behavior in autonomous AI agents.*

    **Research Focus**

    *Emergent deception, reward hacking, auditor detection, and behavioral changes under pressure in multi-agent organizations.*

    **Features Included**

    - Multi-Agent Simulation
    - Behaviour Analysis
    - Auditor Detection
    - Personality Analysis
    - Pressure Analysis
    - Developer Comparison
    - Correlation Analysis
    - Interactive Dashboard
    - Dataset Explorer
    - CSV Export

    ---
    """
)