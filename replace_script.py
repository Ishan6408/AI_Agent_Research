import os
import re

filepath = 'frontend/src/pages/Reports.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("|| 'N/A'", "|| '[NO_DATA]'")
content = content.replace("? `${overview.detection_rate_pct.toFixed(1)}%` : 'N/A'", "? `${overview.detection_rate_pct.toFixed(1)}%` : '[NO_DATA]'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
