"""
Analytics service — reads from ExperimentAnalyzer (JSON or CSV fallback)
and exposes aggregated data matching the Streamlit dashboard calculations.

IMPORTANT: No research/analysis logic lives here.  All computations mirror
what analysis/dashboard.py already performs so React receives the same
numbers the Streamlit dashboard shows.
"""

from fastapi import HTTPException
from analysis.analyzer import ExperimentAnalyzer
import pandas as pd
import math


# -----------------------------------------------------------------------
# Internal helpers
# -----------------------------------------------------------------------

def _replace_nan(obj):
    """
    Recursively replace NaN / Inf / pandas-NA / numpy scalar types with
    JSON-safe Python values so FastAPI can serialise the response.
    """
    if isinstance(obj, dict):
        return {k: _replace_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_replace_nan(v) for v in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    # numpy scalar int / float types
    try:
        import numpy as np
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            v = float(obj)
            return None if (math.isnan(v) or math.isinf(v)) else v
        if isinstance(obj, np.bool_):
            return bool(obj)
    except ImportError:
        pass
    # pandas NA
    try:
        if pd.isna(obj):
            return None
    except (TypeError, ValueError):
        pass
    return obj


def _get_df() -> pd.DataFrame:
    """Load the full dataset, raising 404 when empty."""
    analyzer = ExperimentAnalyzer()
    df = analyzer.create_dataframe()
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found or empty")
    return df


def _bool_to_numeric(series: pd.Series) -> pd.Series:
    """
    Convert a deception_detected column (which may be bool, 'True'/'False'
    string, or 1/0) to a numeric float Series for aggregation.
    Matches the same mapping Streamlit's safe_percentage() uses.
    """
    if series.dtype == bool:
        return series.astype(float)

    numeric = pd.to_numeric(series, errors="coerce")
    if numeric.notna().any():
        return numeric.astype(float)

    # String mapping (matches Streamlit dashboard)
    normalized = series.astype(str).str.strip().str.lower()
    mapping = {
        "true": 1.0, "false": 0.0,
        "yes": 1.0, "no": 0.0,
        "1": 1.0, "0": 0.0,
        "detected": 1.0, "not detected": 0.0,
    }
    return normalized.map(mapping)


# -----------------------------------------------------------------------
# Overview  →  GET /api/analytics/overview
# Mirrors the KPI row in analysis/dashboard.py
# -----------------------------------------------------------------------

def get_overview():
    df = _get_df()

    metrics: dict = {"total_experiments": len(df)}

    numeric_cols = [
        "actual_progress", "reported_progress", "deception_gap",
        "bugs_introduced", "code_quality", "honesty_score",
        "stress_index", "performance_score", "auditor_score",
    ]
    for col in numeric_cols:
        if col in df.columns:
            metrics[f"avg_{col}"] = round(float(df[col].mean()), 2)

    if "deception_detected" in df.columns:
        det = _bool_to_numeric(df["deception_detected"])
        rate = float(det.mean())
        metrics["detection_rate"] = rate                  # 0-1 fraction
        metrics["detection_rate_pct"] = round(rate * 100, 1)  # %-ready

    # Pressure / personality / behaviour distributions (for Overview tab charts)
    for col in ("pressure", "personality", "behavior_strategy", "developer_role",
                "task_difficulty", "deception_level"):
        if col in df.columns:
            metrics[f"{col}_distribution"] = (
                df[col].value_counts().to_dict()
            )

    return _replace_nan(metrics)


# -----------------------------------------------------------------------
# Group analysis  →  /api/analytics/pressure|personality|developers|behavior
# Matches groupby mean used throughout dashboard.py
# -----------------------------------------------------------------------

def get_group_analysis(column: str):
    df = _get_df()
    if column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{column}' not found in dataset",
        )

    summary = (
        df.groupby(column)
        .mean(numeric_only=True)
        .round(2)
        .reset_index()
    )

    # Also include counts per group so React can show n=X labels
    counts = df.groupby(column).size().reset_index(name="count")
    summary = summary.merge(counts, on=column, how="left")

    return _replace_nan(summary.to_dict(orient="records"))


# -----------------------------------------------------------------------
# Correlation  →  GET /api/analytics/correlation
# Mirrors numeric_df.corr() in dashboard.py (Correlation tab)
# -----------------------------------------------------------------------

def get_correlation():
    df = _get_df()
    numeric = df.select_dtypes(include="number")
    if numeric.shape[1] < 2:
        return {"matrix": {}, "columns": []}
    corr = numeric.corr().round(2)
    return _replace_nan({
        "matrix": corr.to_dict(),
        "columns": list(corr.columns),
    })


# -----------------------------------------------------------------------
# Suspicious experiments  →  GET /api/analytics/suspicious
# Dashboard sorts by auditor_score DESC then shows columns:
#   developer_role, task_name, pressure, personality,
#   behavior_strategy, deception_gap, auditor_score, deception_detected
# -----------------------------------------------------------------------

def get_suspicious():
    df = _get_df()
    if "auditor_score" not in df.columns:
        raise HTTPException(status_code=400, detail="auditor_score column missing")

    suspicious_cols = [
        c for c in [
            "developer_role", "task_name", "pressure", "personality",
            "behavior_strategy", "deception_gap", "auditor_score",
            "deception_detected",
        ]
        if c in df.columns
    ]

    suspicious = (
        df.sort_values("auditor_score", ascending=False)
        .head(10)[suspicious_cols]
    )
    return _replace_nan(suspicious.to_dict(orient="records"))


# -----------------------------------------------------------------------
# Auditor analysis  →  GET /api/analytics/auditor
# Mirrors Auditor tab:
#   - auditor_score distribution data
#   - detection_rate by pressure (as %)
#   - avg auditor_score by pressure
# -----------------------------------------------------------------------

def get_auditor_analysis():
    df = _get_df()

    required = {"deception_detected", "auditor_score"}
    if not required.issubset(df.columns):
        raise HTTPException(
            status_code=400,
            detail=f"Auditor columns missing: {required - set(df.columns)}",
        )

    result: dict = {}

    # Overall detection rate
    det = _bool_to_numeric(df["deception_detected"])
    result["overall_detection_rate"] = round(float(det.mean()) * 100, 1)
    result["overall_avg_auditor_score"] = round(float(df["auditor_score"].mean()), 2)

    # Auditor score histogram buckets (nbins=20 as in dashboard)
    score_series = pd.to_numeric(df["auditor_score"], errors="coerce").dropna()
    if not score_series.empty:
        bins = 20
        counts, edges = pd.cut(score_series, bins=bins, retbins=True)
        hist_df = (
            counts.value_counts()
            .sort_index()
            .reset_index()
        )
        hist_df.columns = ["bucket", "count"]
        hist_df["bucket"] = hist_df["bucket"].astype(str)
        result["score_distribution"] = _replace_nan(hist_df.to_dict(orient="records"))

    # Detection rate by pressure (matching dashboard Auditor tab)
    if "pressure" in df.columns:
        det_tmp = df.copy()
        det_tmp["_det_numeric"] = _bool_to_numeric(det_tmp["deception_detected"])
        pressure_det = (
            det_tmp.groupby("pressure")["_det_numeric"]
            .mean()
            .round(4)
            .reset_index()
        )
        pressure_det["detection_rate_pct"] = (pressure_det["_det_numeric"] * 100).round(1)
        pressure_det = pressure_det.drop(columns=["_det_numeric"])
        result["detection_by_pressure"] = _replace_nan(
            pressure_det.to_dict(orient="records")
        )

        # Avg auditor score by pressure
        score_by_pressure = (
            df.groupby("pressure")["auditor_score"]
            .mean()
            .round(2)
            .reset_index()
        )
        result["score_by_pressure"] = _replace_nan(
            score_by_pressure.to_dict(orient="records")
        )

    return result


# -----------------------------------------------------------------------
# Research findings  →  GET /api/analytics/research-findings
# Mirrors the "Research Findings" section in the Correlation tab
#   most_deceptive_personality, most_deceptive_developer, highest_pressure
# -----------------------------------------------------------------------

def get_research_findings():
    df = _get_df()

    result: dict = {}

    if "personality" in df.columns and "deception_gap" in df.columns:
        personality_gap = df.groupby("personality")["deception_gap"].mean()
        if not personality_gap.empty:
            result["most_deceptive_personality"] = str(personality_gap.idxmax())
            result["personality_deception_means"] = _replace_nan(
                personality_gap.round(2).to_dict()
            )

    if "developer_role" in df.columns and "deception_gap" in df.columns:
        role_gap = df.groupby("developer_role")["deception_gap"].mean()
        if not role_gap.empty:
            result["most_deceptive_developer"] = str(role_gap.idxmax())
            result["developer_deception_means"] = _replace_nan(
                role_gap.round(2).to_dict()
            )

    if "pressure" in df.columns and "deception_gap" in df.columns:
        pressure_gap = df.groupby("pressure")["deception_gap"].mean()
        if not pressure_gap.empty:
            result["highest_deception_pressure"] = str(pressure_gap.idxmax())
            result["pressure_deception_means"] = _replace_nan(
                pressure_gap.round(2).to_dict()
            )

    # Average metrics summary (matching dashboard "Average Metrics" bar chart)
    metric_cols = [
        "performance_score", "honesty_score", "stress_index",
        "bugs_introduced", "code_quality", "auditor_score", "deception_gap",
    ]
    avg_metrics = {
        col: round(float(df[col].mean()), 2)
        for col in metric_cols
        if col in df.columns
    }
    result["average_metrics"] = _replace_nan(avg_metrics)

    return result


# -----------------------------------------------------------------------
# Overview Scatter  →  GET /api/analytics/overview/scatter
# -----------------------------------------------------------------------

def get_overview_scatter():
    try:
        df = _get_df()
    except HTTPException as e:
        if e.status_code == 404:
            return []
        raise

    required = {"stress_index", "deception_gap"}
    if not required.issubset(df.columns):
        return []

    scatter_cols = ["stress_index", "deception_gap"]
    optional_cols = ["pressure", "personality", "developer_role", "deception_level", "performance_score"]
    
    for col in optional_cols:
        if col in df.columns:
            scatter_cols.append(col)

    scatter_df = df.dropna(subset=["stress_index", "deception_gap"])[scatter_cols]
    
    return _replace_nan(scatter_df.to_dict(orient="records"))
