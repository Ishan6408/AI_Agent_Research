from fastapi import HTTPException
from fastapi.responses import FileResponse
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

def get_dataset(filters: dict = None):
    analyzer = ExperimentAnalyzer()
    df = analyzer.create_dataframe()
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found or empty")
    
    if filters:
        for key, value in filters.items():
            if value is not None and key in df.columns:
                df = df[df[key] == value]
                
    records = df.to_dict(orient="records")
    return _replace_nan(records)

def get_dataset_summary():
    analyzer = ExperimentAnalyzer()
    df = analyzer.create_dataframe()
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="Dataset not found or empty")
    
    summary = {
        "total_experiments": len(df),
    }
    
    metrics = [
        "actual_progress", "reported_progress", "deception_gap", 
        "bugs_introduced", "code_quality", "honesty_score", 
        "stress_index", "performance_score", "auditor_score"
    ]
    
    for metric in metrics:
        if metric in df.columns:
            summary[f"avg_{metric}"] = df[metric].mean()
            
    if "deception_detected" in df.columns:
        summary["detection_rate"] = df["deception_detected"].mean()
        
    return _replace_nan(summary)

def export_dataset():
    analyzer = ExperimentAnalyzer()
    df = analyzer.save_csv()
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not found or empty")
    
    csv_path = analyzer.results_folder / "experiment_summary.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="CSV export failed")
        
    return FileResponse(path=csv_path, filename="experiment_summary.csv", media_type="text/csv")
