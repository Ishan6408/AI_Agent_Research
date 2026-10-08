filepath = 'frontend/src/types/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("  detection_rate_pct?: number | null;\n  pressure_distribution?:", "  detection_rate_pct?: number | null;\n  auditor_alert?: boolean;\n  system_status?: string;\n  pressure_distribution?:")
content = content.replace("  deception_detected?: number | null;\n}", "  deception_detected?: number | null;\n  is_alert?: boolean;\n}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
