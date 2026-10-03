"""
Dataset service — exposes raw experiment records and summary statistics.

GET /api/dataset            → list of ExperimentResult dicts (filterable)
GET /api/dataset/summary    → aggregate summary matching Streamlit KPIs
GET /api/dataset/export     → CSV download
"""

import math
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from analysis.analyzer import ExperimentAnalyzer
import pandas as pd
import io


# -----------------------------------------------------------------------
# Internal helpers
# -----------------------------------------------------------------------

def _replace_nan(obj):
    """
    Recursively replace NaN/Inf/pd.NA/numpy scalars with JSON-safe values.
    """
    if isinstance(obj, dict):
        return {k: _replace_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_replace_nan(v) for v in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    try:
        import numpy as np
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            v = float(obj)
            return None if (math.isnan(v) or math.isinf(v)) else v
        if isinstance(obj, np.bool_):
            return bool(obj)
    except ImportError:
        pass
    try:
        if pd.isna(obj):
            return None
    except (TypeError, ValueError):
        pass
    return obj


def _get_df() -> pd.DataFrame:
    """
    Load the full dataset.  Returns an empty DataFrame (not raises) when
    the dataset is empty — callers decide whether that is an error.
    """
    analyzer = ExperimentAnalyzer()
    df = analyzer.create_dataframe()
    if df is None:
        return pd.DataFrame()
    return df


# -----------------------------------------------------------------------
# GET /api/dataset
# Returns all records (with optional server-side equality filters).
# Filters mirror the sidebar filters in analysis/dashboard.py:
#   pressure, developer_role, personality, task_difficulty,
#   behavior_strategy, deception_level, deception_detected
# React may also apply these filters client-side from the full dataset,
# but the backend supports them to allow targeted queries.
# -----------------------------------------------------------------------

def get_dataset(filters: dict = None):
    df = _get_df()

    if df.empty:
        return []

    if filters:
        for key, value in filters.items():
            if value is not None and key in df.columns:
                if key == "deception_detected":
                    # Bool column — cast filter value to match
                    df = df[df[key] == bool(value)]
                else:
                    df = df[df[key] == value]

    records = df.to_dict(orient="records")
    return _replace_nan(records)


# -----------------------------------------------------------------------
# GET /api/dataset/summary
# Matches the 8 KPI metrics displayed in analysis/dashboard.py header
# -----------------------------------------------------------------------

def get_dataset_summary():
    df = _get_df()

    if df.empty:
        return {
            "total_experiments": 0,
            "detection_rate": None,
            "detection_rate_pct": None,
        }

    summary: dict = {"total_experiments": len(df)}

    numeric_cols = [
        "actual_progress", "reported_progress", "deception_gap",
        "bugs_introduced", "code_quality", "honesty_score",
        "stress_index", "performance_score", "auditor_score",
    ]
    for col in numeric_cols:
        if col in df.columns:
            summary[f"avg_{col}"] = round(float(df[col].mean()), 2)

    if "deception_detected" in df.columns:
        det = df["deception_detected"]
        if det.dtype == bool:
            rate = float(det.mean())
        else:
            det_num = pd.to_numeric(det.astype(str).str.lower().map(
                {"true": 1, "false": 0, "1": 1, "0": 0}
            ), errors="coerce")
            rate = float(det_num.mean())
        summary["detection_rate"] = rate
        summary["detection_rate_pct"] = round(rate * 100, 1)

    # Dataset shape metadata (matches Dataset tab "Dataset Information")
    summary["columns"] = list(df.columns)
    summary["column_count"] = len(df.columns)
    summary["missing_values"] = int(df.isna().sum().sum())

    return _replace_nan(summary)


# -----------------------------------------------------------------------
# GET /api/dataset/export
# Returns CSV bytes as a download (matches Streamlit's filtered.to_csv())
# -----------------------------------------------------------------------

def export_dataset():
    analyzer = ExperimentAnalyzer()
    df = analyzer.create_dataframe()

    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found or empty")

    # Write CSV to an in-memory buffer — avoids writing to disk
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=experiment_summary.csv"
        },
    )
