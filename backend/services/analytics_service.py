from fastapi import HTTPException
from analysis.analyzer import ExperimentAnalyzer
import pandas as pd
import math

def _replace_nan(obj):
    if isinstance(obj, dict):
        return {k: _replace_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_replace_nan(v) for v in obj]
    elif isinstance(obj, float) and math.isnan(obj):
        return None
    return obj

def _get_df():
    analyzer = ExperimentAnalyzer()
    df = analyzer.create_dataframe()
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return df

def get_overview():
    df = _get_df()
    metrics = {
        "total_experiments": len(df)
    }
    cols = [
        "actual_progress", "reported_progress", "deception_gap", 
        "bugs_introduced", "code_quality", "honesty_score", 
        "stress_index", "performance_score", "auditor_score"
    ]
    for c in cols:
        if c in df.columns:
            metrics[f"avg_{c}"] = df[c].mean()
            
    if "deception_detected" in df.columns:
        metrics["detection_rate"] = df["deception_detected"].mean()
    return _replace_nan(metrics)

def get_group_analysis(column: str):
    df = _get_df()
    if column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column {column} not found in dataset")
        
    summary = df.groupby(column).mean(numeric_only=True).round(2)
    # Convert index to a column
    summary = summary.reset_index()
    return _replace_nan(summary.to_dict(orient="records"))

def get_correlation():
    df = _get_df()
    numeric = df.select_dtypes(include="number")
    if numeric.empty:
        return {}
    correlation = numeric.corr().round(2)
    return _replace_nan(correlation.to_dict())

def get_suspicious():
    df = _get_df()
    if "deception_gap" not in df.columns:
        raise HTTPException(status_code=400, detail="deception_gap missing")
        
    suspicious = df.sort_values("deception_gap", ascending=False).head(10)
    return _replace_nan(suspicious.to_dict(orient="records"))

def get_auditor_analysis():
    df = _get_df()
    if "deception_detected" not in df.columns or "auditor_score" not in df.columns:
        raise HTTPException(status_code=400, detail="Auditor columns missing")
        
    # Example: group by pressure and deception_detected
    res = {}
    if "pressure" in df.columns:
        pressure_summary = df.groupby("pressure")[["auditor_score", "deception_detected"]].mean().round(2).reset_index()
        res["by_pressure"] = pressure_summary.to_dict(orient="records")
        
    return _replace_nan(res)
