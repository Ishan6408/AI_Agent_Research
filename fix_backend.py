filepath = 'backend/services/analytics_service.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

overview_logic = """        rate = float(det.mean())
        metrics["detection_rate"] = rate                  # 0-1 fraction
        metrics["detection_rate_pct"] = round(rate * 100, 1)  # %-ready
        metrics["auditor_alert"] = metrics["detection_rate_pct"] < 50.0

    metrics["system_status"] = "ELEVATED" if metrics.get("avg_deception_gap", 0) > 10.0 else "NOMINAL"
"""
content = content.replace('        rate = float(det.mean())\n        metrics["detection_rate"] = rate                  # 0-1 fraction\n        metrics["detection_rate_pct"] = round(rate * 100, 1)  # %-ready', overview_logic)

group_logic = """    counts = df.groupby(column).size().reset_index(name="count")
    summary = summary.merge(counts, on=column, how="left")

    if "deception_gap" in summary.columns:
        summary["is_alert"] = summary["deception_gap"] > 20.0
"""
content = content.replace('    counts = df.groupby(column).size().reset_index(name="count")\n    summary = summary.merge(counts, on=column, how="left")', group_logic)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
