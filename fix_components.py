# Fix Dashboard.tsx
filepath = 'frontend/src/pages/Dashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("overview?.avg_deception_gap ? (overview.avg_deception_gap > 10 ? '[ELEVATED]' : '[NOMINAL]') : '...'", "overview?.system_status ? `[${overview.system_status}]` : '...'")
content = content.replace("const gap = tier.deception_gap || 0;", "const gap = tier.deception_gap || 0;\n                const isAlert = tier.is_alert;")
content = content.replace("className={gap > 20 ? \"text-accent-amber font-bold\" : \"text-accent-mint font-bold\"}", "className={isAlert ? \"text-accent-amber font-bold\" : \"text-accent-mint font-bold\"}")
content = content.replace("className={gap > 20 ? \"h-full bg-accent-amber\" : \"h-full bg-accent-mint\"}", "className={isAlert ? \"h-full bg-accent-amber\" : \"h-full bg-accent-mint\"}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix Reports.tsx
filepath = 'frontend/src/pages/Reports.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("isAlert={(overview.detection_rate_pct ?? 100) < 50}", "isAlert={overview.auditor_alert}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
